import MemberSchema from "schemas/servers/Member";
import ChannelSchema from "schemas/servers/Channel";
import UserSchema from "schemas/User";
import ServerSchema from "schemas/servers/Server";
import RoleSchema from "schemas/servers/Role";
import MessageSchema from "schemas/servers/Message";
import DMChannelSchema from "schemas/DMChannel";
import {
    CategoryChannel,
    Invite,
    Member,
    Message,
    Role,
    Server,
    TextChannel,
    VoiceChannel
} from "@furxus/types";

export default {
    Server: {
        owner: async (parent: Server) =>
            MemberSchema.findOne({
                server: parent.id,
                user: parent.owner
            }),
        members: async (parent: Server) =>
            MemberSchema.find({
                server: parent.id
            }),
        channels: async (parent: Server) =>
            ChannelSchema.find({
                server: parent.id
            }),
        roles: async (parent: Server) =>
            RoleSchema.find({
                server: parent.id
            })
    },
    Invite: {
        createdBy: async (parent: Invite) =>
            UserSchema.findOne({
                id: parent.createdBy
            })
    },
    Member: {
        user: async (parent: Member) =>
            UserSchema.findOne({
                id: parent.user
            }),
        server: async (parent: Member) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        roles: async (parent: Member) =>
            RoleSchema.find({
                server: parent.server
            })
    },
    Role: {
        server: async (parent: Role) =>
            ServerSchema.findOne({
                id: parent.server
            })
    },
    TextChannel: {
        server: async (parent: TextChannel) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        messages: async (parent: TextChannel) =>
            MessageSchema.find({
                server: parent.server,
                channel: parent.id
            }),
        category: async (parent: TextChannel) =>
            ChannelSchema.findOne({
                id: parent.category
            })
    },
    VoiceChannel: {
        server: async (parent: VoiceChannel) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        category: async (parent: VoiceChannel) =>
            ChannelSchema.findOne({
                id: parent.category
            })
    },
    CategoryChannel: {
        server: async (parent: CategoryChannel) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        children: async (parent: CategoryChannel) =>
            ChannelSchema.find({
                id: { $in: parent.children }
            })
    },

    Message: {
        author: async (parent: Message) =>
            UserSchema.findOne({
                id: parent.author
            }),
        channel: async (parent: Message) =>
            ChannelSchema.findOne({
                id: parent.channel
            }) ||
            DMChannelSchema.findOne({
                id: parent.channel
            })
    }
};
