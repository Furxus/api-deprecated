import { GraphQLError } from "graphql";
import ServerSchema from "../../schemas/servers/Server";
import MemberSchema from "../../schemas/servers/Member";

export default {
    Query: {
        getMembers: async (_: any, { serverId }: { serverId: string }) => {
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

            return MemberSchema.find({
                server: serverId
            });
        },
        getMember: async (
            _: any,
            { serverId, userId }: { serverId: string; userId: string }
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

            const member = await MemberSchema.findOne({
                server: serverId,
                user: userId
            });

            if (!member)
                throw new GraphQLError("Member not found.", {
                    extensions: {
                        errors: [
                            {
                                type: "member",
                                message: "Member not found."
                            }
                        ]
                    }
                });

            return member;
        }
    }
};
