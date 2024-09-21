import { InferSchemaType, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("No JWT secret provided");

const userSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            index: true
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
        age: Number,
        dateOfBirth: {
            type: Date,
            required: true
        },
        avatar: {
            type: String,
            default: null
        },
        defaultAvatar: {
            type: String,
            required: true
        },
        banner: {
            type: String,
            default: null
        },
        displayName: {
            type: String,
            default: null
        },
        nameAcronym: {
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
            lastLogin: {
                type: Date,
                default: null
            },
            lastLoginTimestamp: {
                type: Number,
                default: null
            },
            lastActive: {
                type: Date,
                default: null
            },
            lastActiveTimestamp: {
                type: Number,
                default: null
            }
        },
        bio: {
            type: String,
            default: null
        },
        badges: {
            type: [String],
            default: []
        },
        password: {
            type: String,
            required: true
        },
        privateKey: {
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
        verified: {
            type: Boolean,
            default: false
        },
        updatedAt: Date,
        updatedTimestamp: Number,
        followers: [String],
        following: [String],
        friends: [String],
        friendRequests: [String],
        blocks: [String],
        blockedBy: [String],
        privacy: {
            visiblity: {
                type: String,
                default: "public"
            },
            posts: {
                type: String,
                default: "public"
            },
            favorites: {
                type: String,
                default: "public"
            },
            likes: {
                type: String,
                default: "public"
            }
        },
        preferences: {
            mode: {
                type: String,
                default: "servers"
            },
            theme: {
                type: String,
                default: "dark"
            }
        },
        reports: [String],
        shares: [String],
        views: {
            type: Number,
            default: 0
        },

        // TODO: Change this to beta after done being in alpha
        type: {
            type: [String],
            default: ["user", "alpha_tester"]
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
        },
        nameAcronym: (this.displayName ?? this.username)
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
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
