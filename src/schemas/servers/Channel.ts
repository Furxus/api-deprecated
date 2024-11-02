import { InferSchemaType, Schema, model } from "mongoose";

const channelSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    server: {
        type: String,
        required: true
    },
    messages: [String],
    category: {
        type: String,
        default: null
    },
    children: {
        type: [String],
        default: null
    },
    type: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: null
    },
    position: {
        type: Number,
        required: true
    },
    nsfw: {
        type: Boolean,
        default: false
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

channelSchema.pre("save", function (next) {
    if (this.type != "category" && this.children?.length > 0)
        throw new Error("Non-category channels cannot have children");

    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

channelSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IChannel = InferSchemaType<typeof channelSchema>;

const channelModel = model("channels", channelSchema);

export type ChannelDocument = ReturnType<(typeof channelModel)["hydrate"]>;

export default channelModel;
