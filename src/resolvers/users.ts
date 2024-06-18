import UserModel from "../schemas/User";
import { validateLogin, validateRegister } from "../Validation";
import bcrypt from "bcrypt";
import { Snowflake } from "@theinternetfolks/snowflake";

import { decrypt, encrypt } from "../struct/Crypt";

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

export default {
    Query: {
        getUser: async (_: any, { id }: { id: string }) => {
            const user = await UserModel.findOne({ id });
            if (!user) throw new Error("User not found");
            return user;
        },
        getUsers: async () => {
            return await UserModel.find();
        }
    },
    Mutation: {
        signupUser: async (_: any, { input }: { input: SignupInput }) => {
            const { error, value } = validateRegister.validate({
                email: input.email,
                username: input.username,
                password: input.password,
                confirmPassword: input.confirmPassword
            });

            if (error) throw new Error(error.message);

            const { username, email, password, confirmPassword } = value;

            if (username === email)
                throw new Error("Username and email cannot be the same");

            const errors = [];

            const userExists = await UserModel.findOne({
                $or: [{ username }, { email }]
            });

            if (userExists) {
                if (userExists.username === username)
                    errors.push("Username is taken");
                if (userExists.email === email)
                    errors.push("Email already exists");
            }

            if (password !== confirmPassword)
                errors.push("Passwords do not match");

            if (errors.length > 0) throw new Error(errors.join(", "));

            const salt = bcrypt.genSaltSync(11);
            const hash = bcrypt.hashSync(password, salt);

            const newPass = encrypt(hash);

            const user = new UserModel({
                id: Snowflake.generate(),
                username,
                email,
                password: newPass
            });

            await user.save();

            return true;
        },
        loginUser: async (_: any, { input }: { input: LoginInput }) => {
            const { usernameOrEmail } = input;

            if (emailRegex.test(usernameOrEmail)) {
                const { error } = validateLogin.validate({
                    email: usernameOrEmail
                });

                if (error) throw new Error(error.message);
            } else {
                const { error } = validateLogin.validate({
                    username: usernameOrEmail
                });

                if (error) throw new Error(error.message);
            }

            const user = await UserModel.findOne({
                $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
            });

            if (!user) throw new Error("User not found");

            const {
                error: passwordError,
                value: { password }
            } = validateLogin.validate({
                password: input.password
            });

            if (passwordError) throw new Error(passwordError.message);

            const pass = bcrypt.compareSync(password, decrypt(user.password));

            if (!pass) throw new Error("Incorrect password");

            const { password: _p, ...rest } = user.toJSON();

            return {
                token: user.generateToken(),
                ...rest
            };
        }
    }
};
