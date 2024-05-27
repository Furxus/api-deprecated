import logger from "../struct/Logger";
import UserModel from "../schemas/User";
import { validateLogin, validateRegister } from "../Validation";
import bcrypt from "bcrypt";
import { Snowflake } from "@theinternetfolks/snowflake";

import { decrypt, encrypt } from "../struct/Crypt";

export default {
    Query: {
        getUser: async (_: any, { id }: { id: string }) => {
            const user = await UserModel.findOne({ id });
            logger.info(user);
            if (!user) throw new Error("User not found");
            return user;
        },
        getUsers: async () => {
            const users = await UserModel.find();
            logger.info(users);
            return users;
        }
    },
    Mutation: {
        signupUser: async (_: any, { input }: { input: SignupInput }) => {
            const { error, value } = validateRegister.validate({
                username: input.username,
                email: input.email,
                password: input.password,
                confirmPassword: input.confirmPassword
            });

            if (error) throw new Error(error.message);

            const { username, email, password, confirmPassword } = value;

            const errors = [];

            const userExists = await UserModel.findOne({
                $or: [{ username }, { email }]
            });

            if (userExists) {
                if (userExists.username === username)
                    errors.push("Username already exists");
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

            return user.generateToken();
        },
        loginUser: async (_: any, { input }: { input: LoginInput }) => {
            const { error, value } = validateLogin.validate({
                email: input.email,
                password: input.password
            });

            if (error) throw new Error(error.message);

            const { email, password } = value;

            const user = await UserModel.findOne({
                email
            });

            if (!user) throw new Error("Email not found");

            const pass = bcrypt.compareSync(password, decrypt(user.password));

            if (!pass) throw new Error("Incorrect password");

            return user.generateToken();
        }
    }
};
