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
        required: true
    },
    joinedTimestamp: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date
    },
    updatedTimestamp: {
        type: Number
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
