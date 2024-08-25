import { resolvers as scalarResolvers } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-ts";
import users from "./servers/users";
import servers from "./servers/servers";
import auth from "./auth";
import UserSchema from "schemas/User";
import ServerSchema from "schemas/servers/Server";
import MessageSchema from "schemas/servers/Message";
import CommentSchema from "schemas/posts/Comment";
import PostSchema from "schemas/posts/Post";
import channels from "./servers/channels";
import messages from "./servers/messages";

import serverScalars from "./servers/scalars";
import postScalars from "./posts/scalars";
import { Report, User } from "@furxus/types";
import posts from "./posts/posts";

// All these make sure that the resolvers are properly typed and all the types extend each other without storing full objects in the database, instead we use IDs
export default {
    ...scalarResolvers,
    ...serverScalars,
    ...postScalars,
    Upload: GraphQLUpload,
    Report: {
        post: async (parent: Report) =>
            MessageSchema.findOne({
                id: parent.post
            }),
        comment: async (parent: Report) =>
            MessageSchema.findOne({
                id: parent.comment
            }),
        server: async (parent: Report) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        user: async (parent: Report) =>
            UserSchema.findOne({
                id: parent.user
            })
    },
    User: {
        servers: async (parent: User) =>
            ServerSchema.find({
                owner: parent.id
            }),
        friends: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.friends }
            }),
        friendRequests: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.friendRequests }
            }),
        posts: async (parent: User) =>
            PostSchema.find({
                user: parent.id
            }),
        comments: async (parent: User) =>
            CommentSchema.find({
                user: parent.id
            }),
        blocks: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.blocks }
            }),
        blockedBy: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.blockedBy }
            }),
        followers: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.followers }
            }),
        following: async (parent: User) =>
            UserSchema.find({
                id: { $in: parent.following }
            })
    },
    Query: {
        apiStatus: () => true,
        ...servers.Query,
        ...users.Query,
        ...channels.Query,
        ...messages.Query,
        ...posts.Query
    },
    Mutation: {
        ...auth.Mutation,
        ...servers.Mutation,
        ...users.Mutation,
        ...channels.Mutation,
        ...messages.Mutation,
        ...posts.Mutation
    },
    Subscription: {
        ...servers.Subscription,
        ...channels.Subscription,
        ...messages.Subscription,
        ...posts.Subscription
    }
};
