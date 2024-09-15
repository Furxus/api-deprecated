import { InferSchemaType, Schema, model } from "mongoose";

const messageSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    edited: {
        type: Boolean,
        default: false
    },
    embeds: {
        type: Array,
        required: false
    },
    attachments: {
        type: Array,
        required: false
    },
    mentions: {
        type: Array,
        required: false
    },
    channel: {
        type: String,
        required: true
    },
    member: {
        type: String,
        required: true
    },
    server: {
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
    updatedAt: Date,
    updatedTimestamp: Number
});

messageSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
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
