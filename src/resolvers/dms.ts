import { User } from "@furxus/types";
import DMChannelSchema from "schemas/DMChannel";
import { genSnowflake } from "struct/Server";

export default {
    Query: {
        getDMs: async (_: any, __: any, { user }: { user: User }) =>
            DMChannelSchema.find({
                $or: [{ recipient1: user.id }, { recipient2: user.id }]
            }),
        getDM: async (
            _: any,
            { id }: { id: string },
            { user }: { user: User }
        ) =>
            DMChannelSchema.findOne({
                id,
                $or: [{ recipient1: user.id }, { recipient2: user.id }]
            })
    },
    Mutation: {
        openDMChannel: async (
            _: any,
            { recipient }: { recipient: string },
            { user }: { user: User }
        ) => {
            if (user.id === recipient) {
                throw new Error("You cannot open a DM channel with yourself.");
            }

            const existingDMChannel = await DMChannelSchema.findOne({
                $or: [
                    { recipient1: user.id, recipient2: recipient },
                    { recipient1: recipient, recipient2: user.id }
                ]
            });

            if (existingDMChannel) return existingDMChannel;

            const dmChannel = new DMChannelSchema({
                id: genSnowflake(),
                recipient1: user.id,
                recipient2: recipient,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            await dmChannel.save();

            return dmChannel;
        }
    },
    Subscription: {}
};
