import { GraphQLError } from "graphql";
import MessageSchema from "schemas/servers/Message";
import ChannelSchema from "schemas/servers/Channel";
import DMChannelSchema from "schemas/DMChannel";
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
                channelId,
                limit,
                cursor
            }: {
                channelId: string;
                limit?: number;
                cursor?: string;
            }
        ) => {
            let channel = await ChannelSchema.findOne({
                id: channelId
            });

            if (!channel)
                channel = await DMChannelSchema.findOne({
                    id: channelId
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

            const messages = await MessageSchema.find({
                channel: channelId,
                ...(cursor
                    ? { createdTimestamp: { $lt: parseInt(cursor) } }
                    : {})
            })
                .sort({ createdTimestamp: -1 })
                .limit(limit ?? 25);

            return messages.reverse();
        }
    },
    Mutation: {
        createMessage: async (
            _: any,
            {
                channelId,
                content
            }: {
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

            // Check if the channel exists
            let channel = await ChannelSchema.findOne({
                id: channelId
            });

            if (!channel)
                channel = await DMChannelSchema.findOne({
                    id: channelId,
                    $or: [{ recipient1: user.id }, { recipient2: user.id }]
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

                if (
                    embed.url.includes("spotify") &&
                    embed.url.includes("track")
                )
                    embed.media = `https://open.spotify.com/embed/track/${embed.url.split("/")[4]}`;

                embeds.push(embed);
            }

            // Create the message
            const message = new MessageSchema({
                id: genSnowflake(),
                channel: channel.id,
                author: user.id,
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
                channelId,
                id: messageId,
                content
            }: {
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

            let channel = await ChannelSchema.findOne({
                id: channelId
            });

            if (!channel)
                channel = await DMChannelSchema.findOne({
                    id: channelId,
                    $or: [{ recipient1: user.id }, { recipient2: user.id }]
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

            if (message.author !== user.id)
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
                channelId,
                id: messageId
            }: {
                channelId: string;
                id: string;
            }
        ) => {
            // Check if the channel exists
            let channel = await ChannelSchema.findOne({
                id: channelId
            });

            if (!channel)
                channel = await DMChannelSchema.findOne({
                    id: channelId
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
                    { channelId }: { channelId: string }
                ) => {
                    return messageCreated.channel === channelId;
                }
            )
        },
        messageEdited: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageEdited),
                async (
                    { messageEdited },
                    { channelId }: { channelId: string }
                ) => {
                    return messageEdited.channel === channelId;
                }
            )
        },
        messageDeleted: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(MessageEvents.MessageDeleted),
                async (
                    { messageDeleted },
                    { channelId }: { channelId: string }
                ) => {
                    return messageDeleted.channel === channelId;
                }
            )
        }
    }
};
