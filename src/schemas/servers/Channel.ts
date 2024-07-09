import { InferSchemaType, Schema, model } from "mongoose";

const channelSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    server: {
        type: String,
        required: true
    },
    messages: {
        type: [
            {
                type: String
            }
        ],
        default: []
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
        default: 0
    },
    nsfw: {
        type: Boolean,
        default: false
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

channelSchema.pre("save", function (next) {
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
