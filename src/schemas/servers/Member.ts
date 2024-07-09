import { InferSchemaType, Schema, model } from "mongoose";

const memberSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    roles: {
        type: [
            {
                type: String
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
        required: true
    },
    user: {
        type: String,
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
