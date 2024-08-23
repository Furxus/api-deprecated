import UserSchema from "schemas/User";
import CommentSchema from "schemas/posts/Comment";
import ReportSchema from "schemas/Report";

export default {
    Post: {
        user: async (parent: any) =>
            UserSchema.findOne({
                id: parent.user
            }),
        mentions: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.mentions }
            }),
        comments: async (parent: any) =>
            CommentSchema.find({
                id: { $in: parent.comments }
            }),
        likes: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.likes }
            }),
        reports: async (parent: any) =>
            ReportSchema.find({
                id: { $in: parent.reports }
            }),
        favorites: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.favorites }
            }),
        shares: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.shares }
            })
    }
};
