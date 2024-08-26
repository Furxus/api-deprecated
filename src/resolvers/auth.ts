import UserModel from "../schemas/User";
import { validateLogin, validateRegister } from "../Validation";
import bcrypt from "bcrypt";
import moment from "moment";
import crypto from "crypto";

import { decrypt, encrypt } from "../struct/Crypt";
import { GraphQLError } from "graphql";
import Cryptr from "cryptr";
import asset from "struct/AssetManagement";
import { genSnowflake } from "struct/Server";
import Auth from "struct/Auth";
import { User } from "@furxus/types";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const species = ["dog", "dragon", "fox", "hyena", "rabbit", "raccoon", "wolf"];

type RegisterInput = {
    username: string;
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
};

type LoginInput = {
    usernameOrEmail: string;
    password: string;
};

export default {
    Mutation: {
        registerUser: async (_: any, { input }: { input: RegisterInput }) => {
            // Grab inputs from the request
            const inputEmail = input.email.toLowerCase();
            const inputUsername = input.username.toLowerCase();
            const dateOfBirth = moment(new Date(input.dateOfBirth));

            // Check if the user is at least 13 years old
            if (moment().diff(dateOfBirth, "years") < 13)
                throw new GraphQLError("You must be at least 13 years old", {
                    extensions: {
                        errors: [
                            {
                                type: "dateOfBirth",
                                message: "You must be at least 13 years old"
                            }
                        ]
                    }
                });

            // Validate the inputs
            const errors = [];

            if (emailRegex.test(inputUsername))
                errors.push("Username cannot be an email");

            const { error, value } = validateRegister.validate(
                {
                    email: inputEmail,
                    username: inputUsername,
                    displayName: input.displayName,
                    password: input.password,
                    confirmPassword: input.confirmPassword
                },
                { abortEarly: false }
            );

            if (error)
                error.details.forEach((e) =>
                    errors.push({
                        type: e.path[0],
                        message: e.message
                    })
                );

            if (errors.length > 0)
                throw new GraphQLError("Validation Error", {
                    extensions: {
                        errors
                    }
                });

            // Grab validated values
            const { username, email, password, confirmPassword } = value;

            if (username === email)
                throw new GraphQLError(
                    "Username and email cannot be the same",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "username",
                                    message:
                                        "Username and email cannot be the same"
                                },
                                {
                                    type: "email",
                                    message:
                                        "Username and email cannot be the same"
                                }
                            ]
                        }
                    }
                );

            // Check if the user exists already
            const userExists = await UserModel.findOne({
                $or: [{ username }, { email }]
            });

            if (userExists) {
                if (userExists.username === username)
                    throw new GraphQLError("Username already exists", {
                        extensions: {
                            errors: [
                                {
                                    type: "username",
                                    message: "Username already exists"
                                }
                            ]
                        }
                    });
                if (userExists.email === email)
                    throw new GraphQLError("Email already exists", {
                        extensions: {
                            errors: [
                                {
                                    type: "email",
                                    message: "Email already exists"
                                }
                            ]
                        }
                    });
            }

            if (password !== confirmPassword)
                throw new GraphQLError("Passwords do not match", {
                    extensions: {
                        errors: [
                            {
                                type: "password",
                                message: "Passwords do not match"
                            },
                            {
                                type: "confirmPassword",
                                message: "Passwords do not match"
                            }
                        ]
                    }
                });

            // Generate salt for the user;s password
            const salt = bcrypt.genSaltSync(11);
            // Hash the password
            const hash = bcrypt.hashSync(password, salt);

            // Create a random generated private key for the user.
            const privateKey = crypto.randomBytes(256).toString("base64");
            // Double encrypt it (Not telling you the second one hehe)
            const encrypted = new Cryptr(privateKey).encrypt(hash);
            const newPass = encrypt(encrypted);

            // Choose a random default avatar for the user
            const randomSpecies =
                species[Math.floor(Math.random() * species.length)];
            const imageUrl = asset.getObjectPublicUrls(
                `defaultAvatar/${randomSpecies}.png`
            );

            // Create user (since the app is in alpha phase, we give them a special role)
            const user = new UserModel({
                id: genSnowflake(),
                username,
                email,
                displayName: value.displayName,
                password: newPass,
                defaultAvatar: imageUrl[0],
                privateKey,
                dateOfBirth: dateOfBirth.toDate(),
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                userRoles: ["alpha-user"]
            });

            await user.save();

            return true;
        },
        loginUser: async (_: any, { input }: { input: LoginInput }) => {
            // Receive inputs from the request
            const usernameOrEmail = input.usernameOrEmail.toLowerCase();

            // Validate the inputs
            const validate: {
                password: string;
                email?: string;
                username?: string;
            } = {
                password: input.password
            };

            if (emailRegex.test(usernameOrEmail))
                validate.email = usernameOrEmail;
            else validate.username = usernameOrEmail;

            const { error } = validateLogin.validate(validate, {
                abortEarly: false
            });

            if (error)
                throw new GraphQLError("Validation Error", {
                    extensions: {
                        errors: error.details.map((e) => ({
                            type: e.path[0],
                            message: e.message
                        }))
                    }
                });

            // Find the user in the database
            const userCreds = await UserModel.findOne({
                $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
            }).select("+password +privateKey");

            if (!userCreds)
                throw new GraphQLError("Invalid credentials", {
                    extensions: {
                        errors: [
                            {
                                type: "password",
                                message: "Invalid credentials"
                            }
                        ]
                    }
                });

            // revalidate the password
            const {
                error: passwordError,
                value: { password }
            } = validateLogin.validate({
                password: input.password
            });

            if (passwordError)
                throw new GraphQLError(passwordError.message, {
                    extensions: {
                        errors: [
                            {
                                type: "password",
                                message: passwordError.message
                            }
                        ]
                    }
                });

            // Decrypt the password
            const decrypted = decrypt(userCreds.password);
            // Compare hashes
            const pass = bcrypt.compareSync(
                password,
                new Cryptr(userCreds.privateKey).decrypt(decrypted)
            );

            if (!pass)
                throw new GraphQLError("Invalid credentials", {
                    extensions: {
                        errors: [
                            {
                                type: "password",
                                message: "Invalid credentials"
                            }
                        ]
                    }
                });

            // Refetch the user from the database without the password and private key
            const user = await UserModel.findOne({
                $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
            }).select("-password -privateKey -email");

            if (!user)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "usernameOrEmail",
                                message: "User not found"
                            }
                        ]
                    }
                });

            return {
                token: encrypt(user.generateToken()),
                ...user.toJSON()
            };
        },
        refreshUser: async (_: any, { token }: { token: string }) => {
            // Decrypt the tokena
            const oldUser = Auth.checkToken(token) as any;
            if (!oldUser)
                throw new GraphQLError("Invalid token", {
                    extensions: {
                        errors: [
                            {
                                type: "token",
                                message: "Invalid token"
                            }
                        ]
                    }
                });

            const user = await UserModel.findOne({
                id: oldUser.id
            }).select("-password -privateKey");

            if (!user)
                throw new GraphQLError("Invalid Token", {
                    extensions: {
                        errors: [
                            {
                                type: "token",
                                message: "Invalid Token"
                            }
                        ]
                    }
                });

            return {
                token: encrypt(user.generateToken()),
                ...user.toJSON()
            };
        },
        updateAuthUser: async (
            _: any,
            { fields, values }: { fields: string[]; values: any[] },
            { user }: { user: User }
        ) => {
            console.log(fields, values);
        }
    }
};
