import UserModel from "../schemas/User";
import { validateLogin, validateRegister } from "../Validation";
import bcrypt from "bcrypt";
import moment from "moment";
import crypto from "crypto";

import { decrypt, encrypt } from "../struct/Crypt";
import { GraphQLError } from "graphql";
import { Snowflake } from "@theinternetfolks/snowflake";
import Cryptr from "cryptr";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export default {
    Mutation: {
        registerUser: async (_: any, { input }: { input: RegisterInput }) => {
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

            const salt = bcrypt.genSaltSync(11);
            const hash = bcrypt.hashSync(password, salt);

            const privateKey = crypto.randomBytes(48).toString("hex");
            const encrypted = new Cryptr(privateKey).encrypt(hash);

            const newPass = encrypt(encrypted);

            const user = new UserModel({
                id: Snowflake.generate(),
                username,
                email,
                displayName: value.displayName,
                password: newPass,
                privateKey,
                dateOfBirth: dateOfBirth.toDate(),
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            await user.save();

            return true;
        },
        loginUser: async (_: any, { input }: { input: LoginInput }) => {
            const usernameOrEmail = input.usernameOrEmail.toLowerCase();

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

            const user = await UserModel.findOne({
                $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
            });

            if (!user)
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

            const decrypted = decrypt(user.password);
            const pass = bcrypt.compareSync(
                password,
                new Cryptr(user.privateKey).decrypt(decrypted)
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

            const { password: _p, privateKey: _pk, ...rest } = user.toJSON();

            return {
                token: encrypt(user.generateToken()),
                ...rest
            };
        }
    }
};
