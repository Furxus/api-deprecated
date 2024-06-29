import { InferSchemaType, Schema, model } from "mongoose";

export const roleSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    hoisted: {
        type: Boolean,
        default: false
    },
    mentionable: {
        type: Boolean,
        default: false
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
    position: {
        type: Number,
        default: 0
    },
    color: {
        type: String,
        default: "default"
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

roleSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IRole = InferSchemaType<typeof roleSchema>;

const roleModel = model("roles", roleSchema);

export type RoleDocument = ReturnType<(typeof roleModel)["hydrate"]>;

export default roleModel;
