import { withFilter } from "graphql-subscriptions";
import { genSnowflake, pubSub } from "struct/Server";
import ChannelSchema from "schemas/servers/Channel";
import ServerSchema from "schemas/servers/Server";
import { GraphQLError } from "graphql";

import { User } from "@furxus/types";
import MemberSchema from "schemas/servers/Member";

enum ChannelEvents {
    ChannelCreated = "CHANNEL_CREATED",
    ChannelDeleted = "CHANNEL_DELETED"
}

export default {
    Query: {
        // Get all the channels from a server
        getChannels: async (
            _: any,
            { serverId, type }: { serverId: string; type: string[] }
        ) => {
            const server = await ServerSchema.findOne({ id: serverId });
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

            if (type) {
                return ChannelSchema.find({
                    server: server.id,
                    type: { $in: type }
                });
            }

            return ChannelSchema.find({
                server: server.id
            });
        },
        // Get a single channel from a server by its ID
        getChannel: async (
            _: any,
            { serverId, id }: { serverId: string; id: string }
        ) => {
            const server = await ServerSchema.findOne({ id: serverId });
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

            const channel = await ChannelSchema.findOne({
                id,
                server: serverId
            });

            if (!channel)
                throw new GraphQLError("Channel not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "channel",
                                message: "Channel not found."
                            }
                        ]
                    }
                });

            return channel;
        }
        // Get all messages from a channel
    },
    Mutation: {
        // Create a channel in a server
        createChannel: async (
            _: any,
            {
                serverId,
                name,
                type
            }: {
                serverId: string;
                name: string;
                type: string;
            }
        ) => {
            // Check if the server exists
            const server = await ServerSchema.findOne({ id: serverId });
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

            // Determine channel position
            const position = (
                await ChannelSchema.find({
                    server: server.id
                })
            ).filter((channel) => channel.type !== "category").length;

            // Create the channel
            const channel = new ChannelSchema({
                id: genSnowflake(),
                name,
                server: server.id,
                type,
                position,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            await channel.save();

            server.channels.push(channel.id);

            await server.save();

            // Send the channel creation to the websocket
            await pubSub.publish(ChannelEvents.ChannelCreated, {
                channelCreated: channel
            });

            return channel;
        },
        // Delete a channel from a server
        deleteChannel: async (
            _: any,
            {
                serverId,
                id: channelId
            }: {
                serverId: string;
                id: string;
            },
            { user }: { user: User }
        ) => {
            // Check if the server exists
            const server = await ServerSchema.findOne({ id: serverId });
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

            if (
                !member.permissions.includes("ManageChannels") &&
                !member.permissions.includes("Administrator") &&
                member.id !== server.owner
            )
                throw new GraphQLError(
                    "You do not have permission to delete channels.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "server",
                                    message:
                                        "You do not have permission to delete channels."
                                }
                            ]
                        }
                    }
                );

            // Check if the channel exists
            const channel = await ChannelSchema.findOne({
                id: channelId,
                server: serverId
            });

            if (!channel)
                throw new GraphQLError("Channel not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "channel",
                                message: "Channel not found."
                            }
                        ]
                    }
                });

            // Delete the channel
            await ChannelSchema.deleteOne({
                id: channelId
            });

            server.channels = server.channels.filter((id) => id !== channelId);

            await server.save();

            // Send the channel deletion to the websocket
            await pubSub.publish(ChannelEvents.ChannelDeleted, {
                channelDeleted: channel
            });

            return channel;
        }
    },
    Subscription: {
        channelCreated: {
            // Subscribe to channel creation events
            subscribe: withFilter(
                () => pubSub.asyncIterator(ChannelEvents.ChannelCreated),
                async (
                    { channelCreated },
                    { serverId }: { serverId: string }
                ) => channelCreated.server === serverId
            )
        },
        channelDeleted: {
            // Subscribe to channel deletion events
            subscribe: withFilter(
                () => pubSub.asyncIterator(ChannelEvents.ChannelDeleted),
                async (
                    { channelDeleted },
                    { serverId }: { serverId: string }
                ) => channelDeleted.server === serverId
            )
        }
    }
};
