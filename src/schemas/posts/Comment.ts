import { InferSchemaType, model, Schema } from "mongoose";

const commentSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    post: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    mentions: [String],
    likes: [String],
    reports: [String],
    createdAt: {
        type: Date,
        required: true
    },
    createdTimestamp: {
        type: Number,
        required: true
    },
    updatedAt: Date,
    updatedTimestamp: Number
});

commentSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

commentSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IComment = InferSchemaType<typeof commentSchema>;

const commentModel = model("comments", commentSchema);

export type CommentDocument = ReturnType<(typeof commentModel)["hydrate"]>;

export default commentModel;
