import { InferSchemaType, model, Schema } from "mongoose";

const friendChannelSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    participants: {
        type: [String],
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

friendChannelSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

friendChannelSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IFriendChannel = InferSchemaType<typeof friendChannelSchema>;

const friendChannelModel = model("friend_channels", friendChannelSchema);

export type FriendChannelDocument = ReturnType<
    (typeof friendChannelModel)["hydrate"]
>;

export default friendChannelModel;
