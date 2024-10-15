import { GraphQLError } from "graphql";
import MessageSchema from "schemas/servers/Message";
import ServerSchema from "schemas/servers/Server";
import ChannelSchema from "schemas/servers/Channel";
import { genSnowflake, pubSub } from "struct/Server";
import { withFilter } from "graphql-subscriptions";
import { User } from "@furxus/types";
import { extractUrls } from "struct/Util";
import urlMetadata from "url-metadata";
import { MessageEmbed } from "@furxus/types";

enum MessageEvents {
    MessageCreated = "MESSAGE_CREATED",
    MessageEdited = "MESSAGE_EDITED",
    MessageDeleted = "MESSAGE_DELETED"
}

export default {
    Query: {
        getMessages: async (
            _: any,
            {
                serverId,
                channelId
            }: {
                serverId: string;
                channelId: string;
                limit?: number;
                cursor?: string;
            }
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
            { user }: { user: User }
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

            const urls = extractUrls(content);
            const metadatas: urlMetadata.Result[] = [];
            for (const url of urls) {
                const metadata = await urlMetadata(url).catch(() => null);
                if (!metadata) continue;
                metadatas.push(metadata);
            }

            const embeds: MessageEmbed[] = [];
            for (const metadata of metadatas) {
                const embed = {
                    title: metadata["og:title"],
                    description: metadata["og:description"].replaceAll(
                        " ",
                        "\n"
                    ),
                    url: metadata["og:url"],
                    image: metadata["og:image"],
                    media:
                        metadata["og:video:secure_url"] ??
                        metadata["og:video:url"] ??
                        null,
                    author: {
                        name: metadata["og:site_name"].split(",")[0],
                        url: metadata["og:url"],
                        iconUrl: !metadata.favicons[0]?.href.startsWith("/")
                            ? (metadata.favicons[0]?.href ?? null)
                            : null
                    }
                };

                if (embed.url.includes("spotify"))
                    embed.media = `https://open.spotify.com/embed/track/${embed.url.split("/")[4]}`;

                embeds.push(embed);
            }

            // Create the message
            const message = new MessageSchema({
                id: genSnowflake(),
                server: server.id,
                channel: channel.id,
                member: user.id,
                content,
                embeds,
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
        editMessage: async (
            _: any,
            {
                serverId,
                channelId,
                id: messageId,
                content
            }: {
                serverId: string;
                channelId: string;
                id: string;
                content: string;
            },
            { user }: { user: User }
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

            if (message.member !== user.id)
                throw new GraphQLError(
                    "You are not the author of this message.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "message",
                                    message:
                                        "You are not the author of this message."
                                }
                            ]
                        }
                    }
                );

            message.content = content;
            message.edited = true;

            const urls = extractUrls(content);
            const metadatas: urlMetadata.Result[] = [];
            for (const url of urls) {
                const metadata = await urlMetadata(url).catch(() => null);
                if (!metadata) continue;
                metadatas.push(metadata);
            }

            const embeds: MessageEmbed[] = [];
            for (const metadata of metadatas) {
                embeds.push({
                    title: metadata["og:title"],
                    description: metadata["og:description"],
                    url: metadata["og:url"],
                    image: metadata["og:image"],
                    author: {
                        name: metadata["og:site_name"],
                        url: metadata["og:url"],
                        iconUrl: !metadata.favicons[0].href.startsWith("/")
                            ? (metadata.favicons[0]?.href ?? null)
                            : null
                    }
                });
            }

            message.embeds = embeds;

            await message.save();

            // Send the message to the websocket
            await pubSub.publish(MessageEvents.MessageEdited, {
                messageEdited: message
            });

            return message;
        },
        deleteMessage: async (
            _: any,
            {
                serverId,
                channelId,
                id: messageId
            }: {
                serverId: string;
                channelId: string;
                id: string;
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

            await MessageSchema.deleteOne({ id: messageId });

            // Send the message to the websocket
            await pubSub.publish(MessageEvents.MessageDeleted, {
                messageDeleted: message
            });

            return message;
        }
    },
    Subscription: {
        messageCreated: {
            // Subscribe to message creation events
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageCreated),
                async (
                    { messageCreated },
                    {
                        serverId,
                        channelId
                    }: { serverId: string; channelId: string }
                ) => {
                    return (
                        messageCreated.server === serverId &&
                        messageCreated.channel === channelId
                    );
                }
            )
        },
        messageEdited: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageEdited),
                async (
                    { messageEdited },
                    {
                        serverId,
                        channelId
                    }: { serverId: string; channelId: string }
                ) => {
                    return (
                        messageEdited.server === serverId &&
                        messageEdited.channel === channelId
                    );
                }
            )
        },
        messageDeleted: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageDeleted),
                async (
                    { messageDeleted },
                    {
                        serverId,
                        channelId
                    }: { serverId: string; channelId: string }
                ) => {
                    return (
                        messageDeleted.server === serverId &&
                        messageDeleted.channel === channelId
                    );
                }
            )
        }
    }
};
