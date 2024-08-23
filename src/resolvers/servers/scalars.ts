import MemberSchema from "schemas/servers/Member";
import ChannelSchema from "schemas/servers/Channel";
import UserSchema from "schemas/User";
import ServerSchema from "schemas/servers/Server";
import RoleSchema from "schemas/servers/Role";
import MessageSchema from "schemas/servers/Message";

export default {
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
            ChannelSchema.find({
                server: parent.id
            }),
        roles: async (parent: any) =>
            RoleSchema.find({
                server: parent.id
            })
    },
    Invite: {
        createdBy: async (parent: any) =>
            UserSchema.findOne({
                id: parent.createdBy
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
            }),
        children: async (parent: any) =>
            ChannelSchema.find({
                id: { $in: parent.children }
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
    }
};
