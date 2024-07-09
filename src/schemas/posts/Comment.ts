import { InferSchemaType, model, Schema } from "mongoose";

const commentSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
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
    mentions: {
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
