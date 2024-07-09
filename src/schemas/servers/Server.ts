import { InferSchemaType, Schema, model } from "mongoose";

const serverSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    nameAcronym: {
        type: String
    },
    owner: {
        type: String,
        required: true
    },
    members: {
        type: [
            {
                type: String
            }
        ],
        default: []
    },
    channels: {
        type: [
            {
                type: String
            }
        ],
        default: []
    },
    roles: {
        type: [
            {
                type: String
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

serverSchema.pre("init", function (next) {
    this.set({
        nameAcronym: this.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
    });

    next();
});

serverSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        nameAcronym: this.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
    });

    next();
});

serverSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now(),
        nameAcronym: this.get("name")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
    });

    next();
});

export type IServer = InferSchemaType<typeof serverSchema>;

const serverModel = model("servers", serverSchema);

export type ServerDocument = ReturnType<(typeof serverModel)["hydrate"]>;

export default serverModel;
