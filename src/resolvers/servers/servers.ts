import MemberSchema from "schemas/servers/Member";
import ServerSchema from "schemas/servers/Server";
import asset from "struct/AssetManagement";
import logger from "struct/Logger";
import ChannelSchema from "schemas/servers/Channel";
import { genSnowflake, pubSub } from "struct/Server";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";
import { User } from "@furxus/types";

type CreateServerInput = {
    name: string;
    icon: any;
};

export type ServerSettings = {
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
    ServerDeleted = "SERVER_DELETED",
    ServerJoined = "SERVER_JOINED",
    ServerLeft = "SERVER_LEFT"
}

export default {
    Query: {
        // Get all the servers the user is in
        getUserServers: async (_: any, __: any, { user }: { user: User }) =>
            await ServerSchema.find({
                members: { $in: [user.id] }
            }).sort({ createdAt: -1 }),
        // Get a single server by its ID
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
        // Get the settings of a server
        getServerSettings: async (
            _: any,
            { id }: { id: string },
            { user }: { user: User }
        ) => {
            // Find the servers
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

            // Find the member
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

            // Check user's appropriate permissions
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
        }
    },
    Mutation: {
        createServer: async (
            _: any,
            { name, icon }: CreateServerInput,
            { user }: { user: User }
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

            // Check if the user uploaded an icon
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

            // Create the server
            const server = new ServerSchema({
                id: genSnowflake(),
                name,
                owner: user.id,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            // Create the category channel (currently not implemented)
            const categoryChannel = new ChannelSchema({
                id: genSnowflake(),
                name: "Text Channels",
                server: server.id,
                type: "category",
                children: [],
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                position: 0
            });

            // Create the general channel
            const channel = new ChannelSchema({
                id: genSnowflake(),
                name: "General",
                server: server.id,
                category: categoryChannel.id,
                type: "text",
                createdAt: new Date(),
                createdTimestamp: Date.now(),
                position: 0
            });

            // Add the general channel to the category channel
            categoryChannel.children.push(channel.id);

            // Create the member (owner)
            const member = new MemberSchema({
                id: user.id,
                user: user.id,
                server: server.id,
                permissions: ["Administrator"],
                joinedAt: new Date(),
                joinedTimestamp: Date.now()
            });

            // Generate an invite code for the server
            server.generateInviteLink(server.id, member.id);

            await member.save();
            await channel.save();
            await categoryChannel.save();

            // Push the member, channel, and category channel to the server
            server.members.push(member.id);
            server.channels.push(categoryChannel.id);

            // Upload the icon if it exists
            if (iconFile) {
                const stream = iconFile.createReadStream();
                let iconUrl;
                if (iconFile.mimetype.includes("gif")) {
                    iconUrl = await asset.uploadStream(
                        stream,
                        `servers/${server.id}/icons/a_${genSnowflake()}.gif`
                    );
                } else {
                    iconUrl = await asset.uploadStream(
                        stream,
                        `servers/${server.id}/icons/${genSnowflake()}.png`
                    );
                }

                if (iconUrl) server.icon = iconUrl.publicUrls[0];
            }

            await server.save();

            // Send the server creation to the websocket
            await pubSub.publish(ServerEvents.ServerCreated, {
                serverCreated: server
            });

            return server;
        },
        joinServer: async (
            _: any,
            { code }: { code: string },
            { user }: { user: User }
        ) => {
            // Verify the code
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

            // Create the member
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

            // Send the server join to the websocket
            await pubSub.publish(ServerEvents.ServerJoined, {
                serverJoined: server
            });

            return server;
        },
        leaveServer: async (
            _: any,
            { id }: { id: string },
            { user }: { user: User }
        ) => {
            // Find the server
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

            // Owner cannot leave the server (they can delete it or have to transfer ownership)
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

            // Check if the user is a member of the server
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

            // Delete the member from the database
            await MemberSchema.deleteOne({ user: user.id, server: server.id });

            // Filter it out of the server's members
            server.members = server.members.filter((m) => m !== member.id);
            await server.save();

            // Send the server leave to the websocket
            await pubSub.publish(ServerEvents.ServerLeft, {
                serverLeft: server
            });

            return server;
        },
        deleteServer: async (
            _: any,
            { id }: { id: string },
            { user }: { user: User }
        ) => {
            // Find the server
            const server = await ServerSchema.findOne({
                id
            });

            if (!server) {
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
            }

            // Check if the user is the owner
            if (server.owner !== user.id) {
                throw new GraphQLError(
                    "You are not the owner of this server.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "server",
                                    message:
                                        "You are not the owner of this server."
                                }
                            ]
                        }
                    }
                );
            }

            // Send the server deletion to the websocket before deleting it, so the client can update
            await pubSub.publish(ServerEvents.ServerDeleted, {
                serverDeleted: server
            });

            // Delete the server
            await ServerSchema.deleteOne({ id });
            await ChannelSchema.deleteMany({ server: id });
            await MemberSchema.deleteMany({ server: id });

            return server;
        }
    },
    Subscription: {
        serverCreated: {
            // Only the owner of the server can see the server creation
            subscribe: withFilter(
                () => pubSub.asyncIterator(ServerEvents.ServerCreated),
                (payload, { userId }: { userId: string }) =>
                    payload.serverCreated.owner === userId
            )
        },
        serverJoined: {
            // Only the member that joined can see the server they joined
            subscribe: withFilter(
                () => pubSub.asyncIterator(ServerEvents.ServerJoined),
                async (payload, { userId }: { userId: string }) => {
                    const member = await MemberSchema.findOne({
                        server: payload.serverJoined.id,
                        user: userId
                    });

                    return member !== null && member !== undefined;
                }
            )
        },
        serverLeft: {
            // Only the member that left can see the server they left
            subscribe: withFilter(
                () => pubSub.asyncIterator(ServerEvents.ServerLeft),
                async (payload, { userId }: { userId: string }) => {
                    const member = await MemberSchema.findOne({
                        server: payload.serverLeft.id,
                        user: userId
                    });

                    return member === null || member === undefined;
                }
            )
        },
        serverDeleted: {
            // Only the owner of the server can see the server deletion
            subscribe: withFilter(
                () => pubSub.asyncIterator(ServerEvents.ServerDeleted),
                (payload, { userId }: { userId: string }) =>
                    payload.serverDeleted.owner === userId
            )
        }
    }
};
