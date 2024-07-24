import { Snowflake } from "@theinternetfolks/snowflake";
import MemberSchema from "schemas/servers/Member";
import ServerSchema from "schemas/servers/Server";
import asset from "struct/AssetManagement";
import logger from "struct/Logger";
import ChannelSchema from "schemas/servers/Channel";
import { pubsub } from "struct/Server";
import { GraphQLError } from "graphql";

type CreateServerInput = {
    name: string;
    icon: any;
};

export default {
    Query: {
        getUserServers: async (
            _: any,
            { id }: { id: string },
            { user }: { user: any }
        ) => {
            let servers = [];
            if (!id) {
                servers = await ServerSchema.find({ owner: user.id });
            } else {
                servers = await ServerSchema.find({ owner: id });
            }

            return servers.sort(
                (a, b) => b.createdTimestamp - a.createdTimestamp
            );
        },
        getServer: async (_: any, { id }: { id: string }) => {
            return await ServerSchema.findOne({ id });
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
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            const channel = new ChannelSchema({
                id: Snowflake.generate(),
                name: "general",
                server: server.id,
                category: categoryChannel.id,
                type: "text",
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            let member = await MemberSchema.findOne({
                user: user.id,
                server: server.id
            });

            if (!member)
                member = new MemberSchema({
                    id: user.id,
                    user: user.id,
                    server: server.id,
                    joinedAt: new Date(),
                    joinedTimestamp: Date.now()
                });

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

            await pubsub.publish("SERVER_CREATED", {
                serverCreated: server
            });

            return server;
        }
    },
    Subscription: {
        serverCreated: {
            subscribe: () => pubsub.asyncIterator("SERVER_CREATED")
        }
    }
};
