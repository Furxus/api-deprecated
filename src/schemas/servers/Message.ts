import { InferSchemaType, Schema, model } from "mongoose";

export const messageSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    channel: {
        type: String,
        ref: "channels",
        required: true
    },
    member: {
        type: String,
        ref: "members",
        required: true
    },
    server: {
        type: String,
        ref: "servers",
        required: true
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

messageSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });
    next();
});

export type IMessage = InferSchemaType<typeof messageSchema>;

const messageModel = model("messages", messageSchema);

export type MessageDocument = ReturnType<(typeof messageModel)["hydrate"]>;

export default messageModel;
