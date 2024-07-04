import { Schema } from "mongoose";

export const reportSchmea = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        ref: "users",
        required: true
    },
    post: {
        type: String,
        ref: "posts"
    },
    comment: {
        type: String,
        ref: "comments"
    },
    server: {
        type: String,
        ref: "servers"
    },
    reason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdTimestamp: {
        type: Number,
        default: Date.now()
    }
});
