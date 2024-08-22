import { Snowflake } from "@theinternetfolks/snowflake";
import MemberSchema from "schemas/servers/Member";
import ServerSchema from "schemas/servers/Server";
import asset from "struct/AssetManagement";
import logger from "struct/Logger";
import ChannelSchema from "schemas/servers/Channel";
import { pubsub } from "struct/Server";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";

export default {
    Query: {
        // Get all the servers the user is in
        getUserServers: async (_: any, { id }: { id: string }) =>
            await ServerSchema.find({
                members: { $in: [id] }
            }),
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
            { user }: { user: any }
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
        },
        // Check if the user has access to the server
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
                id: Snowflake.generate(),
                name,
                owner: user.id,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            // Create the category channel (currently not implemented)
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

            // Create the general channel
            const channel = new ChannelSchema({
                id: Snowflake.generate(),
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
            server.channels.push(channel.id);
            server.channels.push(categoryChannel.id);

            // Upload the icon if it exists
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

            // Send the server creation to the websocket
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
            // `
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
            await pubsub.publish(ServerEvents.ServerLeft, {
                serverLeft: server
            });

            return server;
        }
    },
    Subscription: {
        serverCreated: {
            // Only the owner of the server can see the server creation
            subscribe: withFilter(
                () => pubsub.asyncIterator(ServerEvents.ServerCreated),
                (payload, { userId }) => payload.serverCreated.owner === userId
            )
        },
        serverJoined: {
            // Only the member that joined can see the server they joined
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
            // Only the member that left can see the server they left
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
