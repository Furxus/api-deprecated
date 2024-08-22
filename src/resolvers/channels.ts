import { withFilter } from "graphql-subscriptions";
import { pubsub } from "struct/Server";
import ChannelSchema from "schemas/servers/Channel";
import ServerSchema from "schemas/servers/Server";
import { GraphQLError } from "graphql";
import { Snowflake } from "@theinternetfolks/snowflake";
import MessageSchema from "schemas/servers/Message";

enum ChannelEvents {
    ChannelCreated = "CHANNEL_CREATED",
    ChannelDeleted = "CHANNEL_DELETED",
    MessageCreated = "MESSAGE_CREATED"
}

export default {
    Query: {
        // Get all the channels from a server
        getChannels: async (_: any, { serverId }: { serverId: string }) => {
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

            return ChannelSchema.find({
                server: serverId
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
        },
        // Get all messages from a channel
        getMessages: async (
            _: any,
            { serverId, channelId }: { serverId: string; channelId: string }
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

            return MessageSchema.find({
                server: serverId,
                channel: channelId
            });
        }
    },
    Mutation: {
        // Create a channel in a server
        createChannel: async (_: any, { serverId, name, type }: any) => {
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
                id: Snowflake.generate(),
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
            await pubsub.publish(ChannelEvents.ChannelCreated, {
                channelCreated: channel
            });

            return channel;
        },
        // Create a message in a channel
        createMessage: async (
            _: any,
            {
                serverId,
                channelId,
                content
            }: {
                serverId: string;
                channelId: string;
                content: string;
            },
            { user }: { user: any }
        ) => {
            // Check if the message is valid
            if (content.length < 1 || content.length > 2000)
                throw new GraphQLError(
                    "Message must be between 1 and 2000 characters.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "message",
                                    message:
                                        "Message must be between 1 and 2000 characters."
                                }
                            ]
                        }
                    }
                );

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

            // Create the message
            const message = new MessageSchema({
                id: Snowflake.generate(),
                server: server.id,
                channel: channel.id,
                member: user.id,
                content,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            channel.messages.push(message.id);

            await message.save();

            // Send the message to the websocket
            await pubsub.publish(ChannelEvents.MessageCreated, {
                messageCreated: message
            });

            return message;
        }
    },
    Subscription: {
        channelCreated: {
            // Subscribe to channel creation events
            subscribe: withFilter(
                () => pubsub.asyncIterator(ChannelEvents.ChannelCreated),
                async (payload, _, { user }) => {
                    const server = await ServerSchema.findOne({
                        id: payload.channelCreated.server
                    });
                    if (!server) return false;

                    return server.members.includes(user.id);
                }
            )
        },
        messageCreated: {
            // Subscribe to message creation events
            subscribe: withFilter(
                () => pubsub.asyncIterator(ChannelEvents.MessageCreated),
                async (_, { serverId, channelId }, { user }) => {
                    const server = await ServerSchema.findOne({ id: serverId });
                    if (!server) return false;
                    const channel = await ChannelSchema.findOne({
                        id: channelId,
                        server: serverId
                    });

                    if (!channel) return false;
                    return server.members.includes(user.id);
                }
            )
        }
    }
};
