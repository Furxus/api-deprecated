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
