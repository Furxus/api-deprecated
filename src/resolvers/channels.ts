import { withFilter } from "graphql-subscriptions";
import { pubsub } from "struct/Server";
import ChannelSchema from "schemas/servers/Channel";
import ServerSchema from "schemas/servers/Server";
import { GraphQLError } from "graphql";
import { Snowflake } from "@theinternetfolks/snowflake";
import MessageSchema from "schemas/servers/Message";

enum ChannelEvents {
    ChannelCreated = "CHANNEL_CREATED",
    MessageCreated = "MESSAGE_CREATED"
}

export default {
    Query: {
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
        createChannel: async (_: any, { serverId, name, type }: any) => {
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

            const allChannels = (
                await ChannelSchema.find({
                    server: server.id
                })
            ).filter((channel) => channel.type !== "category");

            const channel = new ChannelSchema({
                id: Snowflake.generate(),
                name,
                server: server.id,
                type,
                position: allChannels.length,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            await channel.save();

            server.channels.push(channel.id);

            await server.save();

            await pubsub.publish(ChannelEvents.ChannelCreated, {
                channelCreated: channel
            });

            return channel;
        },
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

            await pubsub.publish(ChannelEvents.MessageCreated, {
                messageCreated: message
            });

            return message;
        }
    },
    Subscription: {
        channelCreated: {
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
