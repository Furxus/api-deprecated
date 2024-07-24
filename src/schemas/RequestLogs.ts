import { Schema, InferSchemaType, model } from "mongoose";

const requestLogSchema = new Schema({
    ips: {
        type: [String],
        default: []
    },
    agents: {
        type: [String],
        default: []
    },
    languages: {
        type: [String],
        default: []
    },
    locations: {
        type: [String],
        default: []
    },
    associatedUsers: {
        type: [String],
        default: []
    },
    firstRequest: {
        type: Date,
        required: true
    },
    firstRequestTimestamp: {
        type: Number,
        required: true
    },
    lastRequest: {
        type: Date
    },
    lastRequestTimestamp: {
        type: Number
    },
    totalRequests: {
        type: Number,
        default: 0
    }
});

requestLogSchema.pre("save", function (next) {
    this.set({
        lastRequest: new Date(),
        lastRequestTimestamp: Date.now(),
        totalRequests: this.totalRequests + 1
    });

    next();
});

requestLogSchema.pre("updateOne", function (next) {
    this.set({
        lastRequest: new Date(),
        lastRequestTimestamp: Date.now(),
        totalRequests: this.get("totalRequests") + 1
    });

    next();
});

export type IRequestLog = InferSchemaType<typeof requestLogSchema>;

const requestLogModel = model("requestLogs", requestLogSchema);

export type RequestLogDocument = ReturnType<
    (typeof requestLogModel)["hydrate"]
>;

export default requestLogModel;
