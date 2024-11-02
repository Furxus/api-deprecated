import { InferSchemaType, Schema, model } from "mongoose";

const memberSchema = new Schema({
    roles: [String],
    permissions: [],
    server: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        required: true
    },
    joinedTimestamp: {
        type: Number,
        required: true
    },
    updatedAt: Date,
    updatedTimestamp: Number
});

memberSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

memberSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IMember = InferSchemaType<typeof memberSchema>;

const memberModel = model("members", memberSchema);

export type MemberDocument = ReturnType<(typeof memberModel)["hydrate"]>;

export default memberModel;
