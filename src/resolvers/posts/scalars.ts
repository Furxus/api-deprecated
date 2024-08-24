import UserSchema from "schemas/User";
import CommentSchema from "schemas/posts/Comment";
import ReportSchema from "schemas/Report";
import { Post } from "@furxus/types";

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
    }
};
