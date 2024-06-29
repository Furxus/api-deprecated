import { InferSchemaType, Schema, model } from "mongoose";

export const serverSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    owner: {
        ref: "users",
        required: true
    },
    members: {
        type: [
            {
                type: String,
                ref: "members"
            }
        ],
        default: []
    },
    channels: {
        type: [
            {
                type: String,
                ref: "channels"
            }
        ],
        default: []
    },
    roles: {
        type: [
            {
                type: String,
                ref: "roles"
            }
        ],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdTimestamp: {
        type: Number,
        required: true,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    },
    updatedTimestamp: {
        type: Number,
        default: Date.now()
    },
    icon: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    }
});

serverSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        nameAcronym: this.get("name")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
    });

    next();
});

export type IServer = InferSchemaType<typeof serverSchema>;

const serverModel = model("servers", serverSchema);

export type ServerDocument = ReturnType<(typeof serverModel)["hydrate"]>;

export default serverModel;
