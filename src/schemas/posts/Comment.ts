import { Schema } from "mongoose";

export const commentSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    post: {
        type: String,
        ref: "posts",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: String,
        ref: "users",
        required: true
    },
    mentions: {
        type: [
            {
                type: String,
                ref: "users"
            }
        ],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdTimestamp: {
        type: Number,
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
});

commentSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});
