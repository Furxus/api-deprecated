import MemberSchema from "schemas/servers/Member";
import ChannelSchema from "schemas/servers/Channel";
import UserSchema from "schemas/User";
import ServerSchema from "schemas/servers/Server";
import RoleSchema from "schemas/servers/Role";
import MessageSchema from "schemas/servers/Message";
import { Channel, Invite, Member, Message, Role, Server } from "@furxus/types";

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
    Channel: {
        server: async (parent: Channel) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        messages: async (parent: Channel) =>
            MessageSchema.find({
                server: parent.server,
                channel: parent.id
            }),
        category: async (parent: Channel) =>
            ChannelSchema.findOne({
                id: parent.category
            }),
        children: async (parent: Channel) =>
            ChannelSchema.find({
                id: { $in: parent.children }
            })
    },
    Message: {
        member: async (parent: Message) =>
            MemberSchema.findOne({
                server: parent.server,
                user: parent.member
            }),
        server: async (parent: Message) =>
            ServerSchema.findOne({
                id: parent.server
            }),
        channel: async (parent: Message) =>
            ChannelSchema.findOne({
                id: parent.channel
            })
    }
};
