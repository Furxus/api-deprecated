import { Snowflake } from "@theinternetfolks/snowflake";
import MemberSchema from "schemas/servers/Member";
import ServerSchema from "schemas/servers/Server";
import asset from "struct/AssetManagement";
import logger from "struct/Logger";
import ChannelSchema from "schemas/servers/Channel";
import { pubsub } from "struct/Server";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";

type CreateServerInput = {
    name: string;
    icon: any;
};

type ServerSettings = {
    roles: string[] | null;
    channels: string[] | null;
    invites:
        | {
              code: string;
              uses: number;
              maxUses: number;
              expiresAt: Date | null;
              expiresTimestamp: number | null;
              createdAt: Date;
              createdTimestamp: number;
          }[]
        | null;
};

enum ServerEvents {
    ServerCreated = "SERVER_CREATED",
    ServerJoined = "SERVER_JOINED",
    ServerLeft = "SERVER_LEFT"
}

export default {
    Query: {
        getUserServers: async (_: any, { id }: { id: string }) =>
            (
                await ServerSchema.find({
                    members: { $in: [id] }
                })
            ).sort((a, b) => b.createdTimestamp - a.createdTimestamp),
        getServer: async (_: any, { id }: { id: string }) => {
            const server = await ServerSchema.findOne({ id });
            if (!server)
                throw new GraphQLError("Server not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "Server not found."
                            }
                        ]
                    }
                });

            return server;
        },
        getServerSettings: async (
            _: any,
            { id }: { id: string },
            { user }: { user: any }
        ) => {
            const server = await ServerSchema.findOne({ id });
            if (!server)
                throw new GraphQLError("Server not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "Server not found."
                            }
                        ]
                    }
                });

            const member = await MemberSchema.findOne({
                server: server.id,
                user: user.id
            });

            if (!member)
                throw new GraphQLError("You are not a member of this server.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "You are not a member of this server."
                            }
                        ]
                    }
                });

            const { permissions } = member;

            const settings: ServerSettings = {
                roles: null,
                channels: null,
                invites: null
            };

            if (!permissions.includes("Administrator")) {
                if (permissions.includes("ManageRoles"))
                    settings.roles = server.roles;
                if (permissions.includes("ManageChannels"))
                    settings.channels = server.channels;
                if (permissions.includes("ManageInvites"))
                    settings.invites = server.invites;
            } else {
                settings.roles = server.roles;
                settings.channels = server.channels;
                settings.invites = server.invites;
            }

            return settings;
        },
        checkServerAccess: async (
            _: any,
            { id }: { id: string },
            { user }: { user: any }
        ) => {
            const server = await ServerSchema.findOne({ id });
            if (!server) return false;
            return server.members.includes(user.id);
        }
    },
    Mutation: {
        createServer: async (
            _: any,
            { name, icon }: CreateServerInput,
            { user }: { user: any }
        ) => {
            if (!name)
                throw new GraphQLError("Name is required.", {
                    extensions: {
                        errors: [
                            {
                                type: "name",
                                message: "Name is required."
                            }
                        ]
                    }
                });

            let iconFile = null;

            try {
                if (icon) {
                    iconFile = await icon;
                }
            } catch (error) {
                logger.error(error);
                throw new GraphQLError(
                    "An error occurred while uploading the icon.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "icon",
                                    message:
                                        "An error occurred while uploading the icon."
                                }
                            ]
                        }
                    }
                );
            }

            const server = new ServerSchema({
                id: Snowflake.generate(),
                name,
                owner: user.id,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            const categoryChannel = new ChannelSchema({
                id: Snowflake.generate(),
                name: "Text Channels",
                server: server.id,
                type: "category",
                children: [],
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                position: 0
            });

            const channel = new ChannelSchema({
                id: Snowflake.generate(),
                name: "general",
                server: server.id,
                category: categoryChannel.id,
                type: "text",
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                position: 0
            });

            categoryChannel.children.push(channel.id);

            const member = new MemberSchema({
                id: user.id,
                user: user.id,
                server: server.id,
                permissions: ["Administrator"],
                joinedAt: new Date(),
                joinedTimestamp: Date.now()
            });

            server.generateInviteLink(server.id, member.id);

            await member.save();
            await channel.save();
            await categoryChannel.save();

            server.members.push(member.id);
            server.channels.push(channel.id);
            server.channels.push(categoryChannel.id);

            if (iconFile) {
                const stream = iconFile.createReadStream();
                let iconUrl;
                if (iconFile.mimetype.includes("gif")) {
                    iconFile = await asset.uploadStream(
                        stream,
                        `servers/${server.id}/a_${Snowflake.generate()}.gif`
                    );
                } else {
                    iconUrl = await asset.uploadStream(
                        stream,
                        `servers/${server.id}/${Snowflake.generate()}.png`
                    );
                }

                if (iconUrl) server.icon = iconUrl.publicUrls[0];
            }

            await server.save();

            await pubsub.publish(ServerEvents.ServerCreated, {
                serverCreated: server
            });

            return server;
        },
        joinServer: async (
            _: any,
            { code }: { code: string },
            { user }: { user: any }
        ) => {
            const server = await ServerSchema.findOne({
                invites: { $elemMatch: { code } }
            });
            if (!server)
                throw new GraphQLError("Invalid invite code.", {
                    extensions: {
                        errors: [
                            {
                                type: "code",
                                message: "Invalid invite code."
                            }
                        ]
                    }
                });

            if (server.members.includes(user.id))
                throw new GraphQLError(
                    "You are already a member of this server.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "code",
                                    message:
                                        "You are already a member of this server."
                                }
                            ]
                        }
                    }
                );

            const member = new MemberSchema({
                id: user.id,
                user: user.id,
                server: server.id,
                joinedAt: new Date(),
                joinedTimestamp: Date.now()
            });

            await member.save();

            server.members.push(member.id);
            await server.save();

            await pubsub.publish(ServerEvents.ServerJoined, {
                serverJoined: server
            });

            return server;
        },
        leaveServer: async (
            _: any,
            { id }: { id: string },
            { user }: { user: any }
        ) => {
            const server = await ServerSchema.findOne({ id });
            if (!server)
                throw new GraphQLError("Server not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "Server not found."
                            }
                        ]
                    }
                });

            if (server.owner === user.id)
                throw new GraphQLError("You cannot leave your own server.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "You cannot leave your own server."
                            }
                        ]
                    }
                });

            const member = await MemberSchema.findOne({
                user: user.id,
                server: server.id
            });

            if (!member)
                throw new GraphQLError("You are not a member of this server.", {
                    extensions: {
                        errors: [
                            {
                                type: "server",
                                message: "You are not a member of this server."
                            }
                        ]
                    }
                });

            await MemberSchema.deleteOne({ user: user.id, server: server.id });

            server.members = server.members.filter((m) => m !== member.id);
            await server.save();

            await pubsub.publish(ServerEvents.ServerLeft, {
                serverLeft: server
            });

            return server;
        }
    },
    Subscription: {
        serverCreated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(ServerEvents.ServerCreated),
                (payload, { userId }) => payload.serverCreated.owner === userId
            )
        },
        serverJoined: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(ServerEvents.ServerJoined),
                async (payload, { userId }) => {
                    const member = await MemberSchema.findOne({
                        server: payload.serverJoined.id,
                        user: userId
                    });

                    return member !== null && member !== undefined;
                }
            )
        },
        serverLeft: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(ServerEvents.ServerLeft),
                async (payload, { userId }) => {
                    const member = await MemberSchema.findOne({
                        server: payload.serverLeft.id,
                        user: userId
                    });

                    return member === null || member === undefined;
                }
            )
        }
    }
};
