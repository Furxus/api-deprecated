import {GraphQLError} from "graphql";
import MessageSchema from "schemas/servers/Message";
import ServerSchema from "schemas/servers/Server";
import ChannelSchema from "schemas/servers/Channel";
import {genSnowflake, pubSub} from "struct/Server";
import {withFilter} from "graphql-subscriptions";
import {User} from "@furxus/types";

enum MessageEvents {
    MessageCreated = "MESSAGE_CREATED",
    MessageDeleted = "MESSAGE_DELETED"
}

export default {
    Query: {
        getMessages: async (
            _: any,
            {serverId, channelId}: { serverId: string; channelId: string }
        ) => {
            const server = await ServerSchema.findOne({id: serverId});
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
            {user}: { user: User }
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
            const server = await ServerSchema.findOne({id: serverId});
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
                id: genSnowflake(),
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
            await pubSub.publish(MessageEvents.MessageCreated, {
                messageCreated: message
            });

            return message;
        },
        deleteMessage: async (
            _: any,
            {serverId, channelId, id: messageId}: {
                serverId: string;
                channelId: string;
                id: string;
            }
        ) => {
            // Check if the server exists
            const server = await ServerSchema.findOne({id: serverId});
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

            // Check if the message exists
            const message = await MessageSchema.findOne({
                id: messageId,
                server: serverId,
                channel: channelId
            });

            if (!message)
                throw new GraphQLError("Message not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "message",
                                message: "Message not found."
                            }
                        ]
                    }
                });

            await MessageSchema.deleteOne({id: messageId});

            return message;
        }
    },
    Subscription: {
        messageCreated: {
            // Subscribe to message creation events
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageCreated),
                async (_, {serverId, channelId}: { serverId: string, channelId: string }, {user}: { user: User }) => {
                    const server = await ServerSchema.findOne({id: serverId});
                    if (!server) return false;
                    const channel = await ChannelSchema.findOne({
                        id: channelId,
                        server: serverId
                    });

                    if (!channel) return false;
                    return server.members.includes(user.id);
                }
            )
        },
        messageDeleted: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageDeleted),
                async (_, {serverId, channelId}: { serverId: string, channelId: string }, {user}: { user: User }) => {
                    const server = await ServerSchema.findOne({id: serverId});
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
