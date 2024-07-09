import { Snowflake } from "@theinternetfolks/snowflake";
import MemberSchema from "schemas/servers/Member";
import ServerSchema from "schemas/servers/Server";
import asset from "struct/AssetManagement";
import logger from "struct/Logger";

type CreateServerInput = {
    name: string;
    icon: any;
};

export default {
    Query: {},
    Mutation: {
        createServer: async (
            _: any,
            { name, icon }: CreateServerInput,
            { user }: { user: any }
        ) => {
            try {
                let iconFile = null;
                if (icon) {
                    iconFile = await icon;
                }

                const server = new ServerSchema({
                    id: Snowflake.generate(),
                    name,
                    owner: user.id
                });

                let member = await MemberSchema.findOne({
                    user: user.id,
                    server: server.id
                });

                if (!member)
                    member = new MemberSchema({
                        id: user.id,
                        user: user.id,
                        server: server.id
                    });

                await member.save();

                server.members.push(member.id);

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

                return server;
            } catch (error) {
                logger.error(error);
                throw new Error("An error occurred while creating the server.");
            }
        }
    }
};
