import UserSchema from "schemas/User";
import CommentSchema from "schemas/posts/Comment";
import ReportSchema from "schemas/Report";
import PostSchema from "schemas/posts/Post";
import { Comment, Post } from "@furxus/types";

export default {
    Post: {
        user: async (parent: Post) =>
            UserSchema.findOne({
                id: parent.user
            }),
        mentions: async (parent: Post) =>
            UserSchema.find({
                id: { $in: parent.mentions }
            }),
        comments: async (parent: Post) =>
            CommentSchema.find({
                id: { $in: parent.comments }
            }),
        likes: async (parent: Post) =>
            UserSchema.find({
                id: { $in: parent.likes }
            }),
        reports: async (parent: Post) =>
            ReportSchema.find({
                id: { $in: parent.reports }
            }),
        favorites: async (parent: Post) =>
            UserSchema.find({
                id: { $in: parent.favorites }
            }),
        shares: async (parent: Post) =>
            UserSchema.find({
                id: { $in: parent.shares }
            })
    },
    Comment: {
        post: async (parent: Comment) =>
            PostSchema.findOne({
                id: parent.post
            }),
        user: async (parent: Comment) =>
            UserSchema.findOne({
                id: parent.user
            }),
        likes: async (parent: Comment) =>
            UserSchema.find({
                id: { $in: parent.likes }
            }),
        reports: async (parent: Comment) =>
            ReportSchema.find({
                id: { $in: parent.reports }
            })
    }
};
