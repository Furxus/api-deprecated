import { withFilter } from "graphql-subscriptions";
import { pubsub } from "struct/Server";
import ChannelSchema from "schemas/servers/Channel";
import ServerSchema from "schemas/servers/Server";
import { GraphQLError } from "graphql";
import { Snowflake } from "@theinternetfolks/snowflake";

enum ChannelEvents {
    ChannelCreated = "CHANNEL_CREATED"
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

            return ChannelSchema.findOne({
                id,
                server: serverId
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
        }
    }
};
