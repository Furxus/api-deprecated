import { InferSchemaType, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("No JWT secret provided");

const userSchema = new Schema(
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
            type: Date,
            required: true
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
                type: Date
            },
            lastActiveTimestamp: {
                type: Number
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
            required: true
        },
        createdTimestamp: {
            type: Number,
            required: true
        },
        updatedAt: {
            type: Date
        },
        updatedTimestamp: {
            type: Number
        },
        servers: [{ type: String }],
        friends: {
            type: [
                {
                    type: String
                }
            ],
            default: []
        },
        friendRequests: {
            type: [
                {
                    type: String
                }
            ],
            default: []
        },
        posts: [{ type: String }],
        comments: [{ type: String }],
        blocks: [{ type: String }],
        blockedBy: [{ type: String }],
        followers: {
            type: [
                {
                    type: String
                }
            ],
            default: []
        },
        following: {
            type: [
                {
                    type: String
                }
            ],
            default: []
        },
        privacy: {
            favorites: {
                type: String,
                default: "public"
            },
            likes: {
                type: String,
                default: "public"
            }
        },
        reports: [{ type: String }],
        shares: [{ type: String }],
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

userSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        activity: {
            lastActive: new Date(),
            lastActiveTimestamp: Date.now()
        }
    });

    next();
});

userSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        activity: {
            lastActive: new Date(),
            lastActiveTimestamp: Date.now()
        }
    });

    next();
});

export type IUser = InferSchemaType<typeof userSchema>;

const userModel = model("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
