import { InferSchemaType, model, Schema } from "mongoose";

const reportSchmea = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: String,
        required: true
    },
    post: String,
    comment: String,
    server: String,
    reason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    createdTimestamp: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "open"
    }
});

export type IReport = InferSchemaType<typeof reportSchmea>;

const reportModel = model("reports", reportSchmea);

export type ReportDocument = ReturnType<(typeof reportModel)["hydrate"]>;

export default reportModel;
