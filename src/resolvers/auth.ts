import { validateLogin, validateRegister } from "../Validation";
import bcrypt from "bcrypt";
import moment from "moment";
import crypto from "crypto";

import { decrypt, encrypt } from "../struct/Crypt";
import { GraphQLError } from "graphql";
import Cryptr from "cryptr";
import asset from "struct/AssetManagement";
import { colorThief, genSnowflake, mailgun } from "struct/Server";
import Auth from "struct/Auth";

import UserModel from "../schemas/User";
import VerificationModel from "../schemas/Verification";
import { User } from "@furxus/types";
import logger from "struct/Logger";
import { genRandColor } from "struct/Util";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const species = [
    "cat",
    "dog",
    "dragon",
    "fox",
    "hyena",
    "rabbit",
    "raccoon",
    "wolf"
];

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
    Query: {
        verifyUser: async (_: any, { code }: { code: string }) => {
            // Find the verification document in the database
            const verification = await VerificationModel.findOne({
                code
            });

            if (!verification)
                throw new GraphQLError("Invalid verification code", {
                    extensions: {
                        errors: [
                            {
                                type: "code",
                                message: "Invalid verification code"
                            }
                        ]
                    }
                });

            // Find the user in the database
            const user = await UserModel.findOne({
                id: verification.user
            });

            if (!user)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            // Check if the verification has expired
            if (moment().isAfter(verification.expiresAt)) {
                await verification.deleteOne();

                const code = crypto.randomBytes(6).toString("hex");
                const newVerification = new VerificationModel({
                    id: genSnowflake(),
                    user: user.id,
                    code,
                    expiresAt: moment().add(1, "day").toDate(),
                    expiresTimestamp: moment().add(1, "day").unix()
                });

                const verificationUrl = `${process.env.FRONTEND_URL}/verify/${newVerification.code}`;

                await mailgun.messages.create("furxus.com", {
                    from: "verify@furxus.com",
                    to: user.email,
                    subject: "Furxus - Verify your email",
                    template: "email verification template",
                    "h:X-Mailgun-Variables": JSON.stringify({
                        verification_url: verificationUrl
                    })
                });

                await newVerification.save();

                throw new GraphQLError(
                    "Verification code has expired, we are going to send you a new one",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "code",
                                    message:
                                        "Verification code has expired, we are going to send you a new one"
                                }
                            ]
                        }
                    }
                );
            }

            // Verify the user
            user.verified = true;
            await user.save();
            await verification.deleteOne();

            return true;
        }
    },
    Mutation: {
        registerUser: async (_: any, { input }: { input: RegisterInput }) => {
            // Grab inputs from the request
            const inputEmail = input.email.toLowerCase();
            const inputUsername = input.username.toLowerCase();
            const dateOfBirth = moment(
                new Date(input.dateOfBirth),
                "MM/DD/YYYY"
            );
            if (!dateOfBirth.isValid())
                throw new GraphQLError("Invalid date of birth", {
                    extensions: {
                        errors: [
                            {
                                type: "dateOfBirth",
                                message:
                                    "Make sure that the date of birth is in the format MM/DD/YYYY"
                            }
                        ]
                    }
                });

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
            let { dominantColor }: any = await colorThief.getColorAsync(
                imageUrl[0],
                { colorType: "hex" }
            );

            if (!dominantColor) {
                dominantColor = genRandColor();
            }

            // Create user (since the app is in alpha phase, we give them a special role)
            const user = new UserModel({
                id: genSnowflake(),
                username,
                email,
                displayName: value.displayName,
                password: newPass,
                defaultAvatar: imageUrl[0],
                accentColor: dominantColor,
                privateKey,
                dateOfBirth: dateOfBirth.toDate(),
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                userRoles: ["alpha-user"]
            });

            const code = crypto.randomBytes(6).toString("hex");

            // Create a verification document
            const verification = new VerificationModel({
                id: genSnowflake(),
                user: user.id,
                code,
                expiresAt: moment().add(1, "day").toDate(),
                expiresTimestamp: moment().add(1, "day").unix()
            });

            const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verification.code}`;

            await mailgun.messages.create("furxus.com", {
                from: "verify@furxus.com",
                to: user.email,
                subject: "Furxus - Verify your email",
                template: "email verification template",
                "h:X-Mailgun-Variables": JSON.stringify({
                    verification_url: verificationUrl
                })
            });

            await user.save();
            await verification.save();

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

            await user.save();

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
        updateDefaultAvatar: async (
            _: any,
            { avatar }: { avatar: string },
            { user }: { user: User }
        ) => {
            if (!species.includes(avatar))
                throw new GraphQLError("Default Avatar doesn't exist", {
                    extensions: {
                        errors: [
                            {
                                type: "avatar",
                                message: "Default Avatar doesn't exist"
                            }
                        ]
                    }
                });

            const userDoc = await UserModel.findOne({
                id: user.id
            });

            if (!userDoc)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            const imageUrl = asset.getObjectPublicUrls(
                `defaultAvatar/${avatar}.png`
            );

            let { dominantColor }: any = await colorThief.getColorAsync(
                imageUrl[0],
                { colorType: "hex" }
            );

            if (!dominantColor) {
                dominantColor = genRandColor();
            }

            userDoc.avatar = imageUrl[0];
            userDoc.accentColor = dominantColor;

            await userDoc.save();
            return true;
        },
        updateAvatar: async (
            _: any,
            { avatar }: { avatar: any },
            { user }: { user: User }
        ) => {
            let avatarFile = null;
            try {
                if (avatar) {
                    avatarFile = await avatar;
                }
            } catch (error) {
                logger.error(error);
                throw new GraphQLError(
                    "An error occurred while uploading the icon.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "icon",
                                    message:
                                        "An error occurred while uploading the icon."
                                }
                            ]
                        }
                    }
                );
            }

            const userDoc = await UserModel.findOne({
                id: user.id
            });

            if (!userDoc)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            if (avatarFile) {
                const stream = avatarFile.createReadStream();
                let avatarUrl;
                if (avatarFile.mimetype.includes("gif")) {
                    avatarUrl = await asset.uploadStream(
                        stream,
                        `avatars/${user.id}/a_${genSnowflake()}.gif`,
                        avatarFile.mimetype
                    );
                } else {
                    avatarUrl = await asset.uploadStream(
                        stream,
                        `avatars/${user.id}/${genSnowflake()}.png`,
                        avatarFile.mimetype
                    );
                }

                if (avatarUrl) {
                    userDoc.avatar = avatarUrl.publicUrls[0];
                    // Types for this module is incorrect so for now we are gonna use any
                    let { dominantColor }: any = await colorThief.getColorAsync(
                        userDoc.avatar,
                        { colorType: "hex" }
                    );

                    if (!dominantColor) {
                        dominantColor = genRandColor();
                    }

                    userDoc.accentColor = dominantColor;
                }
            }

            await userDoc.save();
            return true;
        },
        resendEmail: async (_: any, __: any, { user }: { user: User }) => {
            // Delete the old verification document (if it exists)

            const dbUser = await UserModel.findOne({
                id: user.id
            });

            if (!dbUser)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            await VerificationModel.deleteOne({
                user: user.id
            });

            // Create a new verification document
            const code = crypto.randomBytes(6).toString("hex");

            const verification = new VerificationModel({
                id: genSnowflake(),
                user: user.id,
                code,
                expiresAt: moment().add(1, "day").toDate(),
                expiresTimestamp: moment().add(1, "day").unix()
            });

            const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verification.code}`;

            await mailgun.messages.create("furxus.com", {
                from: "verify@furxus.com",
                to: dbUser.email,
                subject: "Furxus - Verify your email",
                template: "email verification template",
                "h:X-Mailgun-Variables": JSON.stringify({
                    verification_url: verificationUrl
                })
            });

            await verification.save();

            return true;
        }
    }
};
