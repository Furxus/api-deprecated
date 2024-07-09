import { InferSchemaType, model, Schema } from "mongoose";

const reportSchmea = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true
    },
    post: {
        type: String
    },
    comment: {
        type: String
    },
    server: {
        type: String
    },
    reason: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdTimestamp: {
        type: Number,
        default: Date.now()
    }
});

export type IReport = InferSchemaType<typeof reportSchmea>;

const reportModel = model("reports", reportSchmea);

export type ReportDocument = ReturnType<(typeof reportModel)["hydrate"]>;

export default reportModel;
