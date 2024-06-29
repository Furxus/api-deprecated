import { InferSchemaType, Schema, model } from "mongoose";

export const memberSchema = new Schema({
    roles: {
        type: [
            {
                type: String,
                ref: "roles"
            }
        ],
        default: []
    },
    permissions: {
        type: Array,
        default: []
    },
    server: {
        type: String,
        ref: "servers",
        required: true
    },
    user: {
        type: String,
        ref: "users",
        required: true
    },
    joinedAt: {
        type: Date,
        default: new Date()
    },
    joinedTimestamp: {
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
