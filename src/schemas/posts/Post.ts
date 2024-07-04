import { InferSchemaType, Schema, model } from "mongoose";

export const postSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    hashtags: {
        type: [
            {
                type: String
            }
        ],
        default: []
    },
    user: {
        type: String,
        ref: "users",
        required: true
    },
    mentions: {
        type: [
            {
                type: String,
                ref: "users"
            }
        ],
        default: []
    },
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
    comments: {
        type: [
            {
                type: String,
                ref: "comments"
            }
        ],
        default: []
    },
    likes: {
        type: [
            {
                type: String,
                ref: "users"
            }
        ],
        default: []
    },
    reports: {
        type: [
            {
                type: String,
                ref: "reports"
            }
        ],
        default: []
    },
    favorites: {
        type: [
            {
                type: String,
                ref: "users"
            }
        ],
        default: []
    },
    shares: {
        type: [
            {
                type: String,
                ref: "users"
            }
        ],
        default: []
    },
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
    }
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
