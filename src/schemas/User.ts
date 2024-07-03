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
        age: {
            type: Number
        },
        dateOfBirth: {
            type: Date
        },
        avatar: {
            type: String,
            default: null
        },
        banner: {
            type: String,
            default: null
        },
        displayName: {
            type: String,
            default: null
        },
        activity: {
            status: {
                type: String,
                default: "offline"
            },
            text: {
                type: String,
                default: null
            },
            lastActive: {
                type: Date,
                default: new Date()
            },
            lastActiveTimestamp: {
                type: Number,
                default: Date.now()
            }
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
        },
        servers: [{ type: String, ref: "servers" }],
        friends: {
            type: [
                {
                    type: String,
                    ref: "users"
                }
            ],
            default: []
        },
        friendRequests: {
            type: [
                {
                    type: String,
                    ref: "users"
                }
            ],
            default: []
        },
        posts: [{ type: String, ref: "posts" }],
        comments: [{ type: String, ref: "comments" }],
        blocks: [{ type: String, ref: "users" }],
        blockedBy: [{ type: String, ref: "users" }],
        followers: {
            type: [
                {
                    type: String,
                    ref: "users"
                }
            ],
            default: []
        },
        following: {
            type: [
                {
                    type: String,
                    ref: "users"
                }
            ],
            default: []
        },
        favorites: {
            privacy: {
                type: String,
                default: "public"
            },
            posts: {
                type: [
                    {
                        type: String,
                        ref: "posts"
                    }
                ],
                default: []
            }
        },
        likes: {
            privacy: {
                type: String,
                default: "public"
            },
            posts: {
                type: [
                    {
                        type: String,
                        ref: "posts"
                    }
                ],
                default: []
            }
        },
        reports: [{ type: String, ref: "posts" }],
        shares: [{ type: String, ref: "posts" }],
        views: {
            type: Number,
            default: 0
        }
    },
    {
        methods: {
            generateToken: function () {
                const { password: _p, _id: _d, ...user } = this.toObject();
                return jwt.sign(user, JWT_SECRET!);
            }
        }
    }
);

userSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IUser = InferSchemaType<typeof userSchema>;

const userModel = model("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
