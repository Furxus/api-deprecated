import { InferSchemaType, Schema, model } from "mongoose";

const postSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    hashtags: [String],
    user: {
        type: String,
        required: true
    },
    mentions: [String],
    content: {
        text: {
            type: String,
            default: null
        },
        image: {
            type: String,
            default: null
        },
        video: {
            type: String,
            default: null
        },
        audio: {
            type: String,
            default: null
        }
    },
    nsfw: {
        type: Boolean,
        default: false
    },
    comments: [String],
    likes: [String],
    reports: [String],
    favorites: [String],
    shares: [String],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
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

postSchema.pre("save", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

postSchema.pre("updateOne", function (next) {
    this.set({
        updatedAt: new Date(),
        updatedTimestamp: Date.now()
    });

    next();
});

export type IPost = InferSchemaType<typeof postSchema>;

const postModel = model("posts", postSchema);

export type PostDocument = ReturnType<(typeof postModel)["hydrate"]>;

export default postModel;
