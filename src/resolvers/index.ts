import { resolvers as scalarResolvers } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-ts";
import users from "./users";
import servers from "./servers";
import auth from "./auth";
import MemberSchema from "schemas/servers/Member";
import UserSchema from "schemas/User";
import ServerSchema from "schemas/servers/Server";
import RoleSchema from "schemas/servers/Role";
import MessageSchema from "schemas/servers/Message";
import CommentSchema from "schemas/posts/Comment";
import ReportSchema from "schemas/Report";
import ChannelSchema from "schemas/servers/Channel";

export default {
    ...scalarResolvers,
    Upload: GraphQLUpload,
    Server: {
        owner: async (parent: any) =>
            MemberSchema.findOne({
                server: parent.id,
                user: parent.owner
            }),
        members: async (parent: any) =>
            MemberSchema.find({
                server: parent.id
            }),
        channels: async (parent: any) =>
            MemberSchema.find({
                server: parent.id
            }),
        roles: async (parent: any) =>
            MemberSchema.find({
                server: parent.id
            })
    },
    Member: {
        user: async (parent: any) =>
            UserSchema.findOne({
                id: parent.user
            }),
        server: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        roles: async (parent: any) =>
            RoleSchema.find({
                server: parent.server
            })
    },
    Role: {
        server: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.server
            })
    },
    Channel: {
        server: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        messages: async (parent: any) =>
            MessageSchema.find({
                server: parent.server,
                channel: parent.id
            }),
        category: async (parent: any) =>
            ChannelSchema.findOne({
                id: parent.category
            })
    },
    Message: {
        member: async (parent: any) =>
            MemberSchema.findOne({
                server: parent.server,
                user: parent.member
            }),
        server: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        channel: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.channel
            })
    },
    Report: {
        post: async (parent: any) =>
            MessageSchema.findOne({
                id: parent.post
            }),
        comment: async (parent: any) =>
            MessageSchema.findOne({
                id: parent.comment
            }),
        server: async (parent: any) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        user: async (parent: any) =>
            UserSchema.findOne({
                id: parent.user
            })
    },
    User: {
        servers: async (parent: any) =>
            ServerSchema.find({
                owner: parent.id
            }),
        friends: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.friends }
            }),
        friendRequests: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.friendRequests }
            }),
        posts: async (parent: any) =>
            MessageSchema.find({
                user: parent.id
            }),
        comments: async (parent: any) =>
            CommentSchema.find({
                user: parent.id
            }),
        blocks: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.blocks }
            }),
        blockedBy: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.blockedBy }
            }),
        followers: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.followers }
            }),
        following: async (parent: any) =>
            UserSchema.find({
                id: { $in: parent.following }
            })
    },
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
    },
    Query: {
        apiStatus: () => true,
        ...servers.Query,
        ...users.Query
    },
    Mutation: {
        ...auth.Mutation,
        ...servers.Mutation,
        ...users.Mutation
    },
    Subscription: {
        ...servers.Subscription
    }
};
