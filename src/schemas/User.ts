import { InferSchemaType, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("No JWT secret provided");

export const userSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        avatar: {
            type: Buffer,
            default: null
        },
        nickname: {
            type: String,
            default: null
        },
        bio: {
            type: String,
            default: null
        },
        password: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: new Date()
        },
        createdTimestamp: {
            type: Number,
            required: true,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: new Date()
        },
        updatedTimestamp: {
            type: Number,
            default: Date.now()
        }
    },
    {
        methods: {
            generateToken: function () {
                const { password, ...user } = this.toObject();
                return jwt.sign(user, JWT_SECRET!);
            }
        }
    }
);

export type IUser = InferSchemaType<typeof userSchema>;

const userModel = model("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
