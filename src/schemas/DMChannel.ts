import { InferSchemaType, model, Schema } from "mongoose";

const dmChannelSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    recipient1: {
        type: String,
        required: true
    },
    recipient2: {
        type: String,
        required: true
    },
    messages: [String],
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

dmChannelSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

dmChannelSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IDMChannel = InferSchemaType<typeof dmChannelSchema>;

const dmChannelModel = model("dm_channels", dmChannelSchema);

export type DMChannelDocument = ReturnType<(typeof dmChannelModel)["hydrate"]>;

export default dmChannelModel;
