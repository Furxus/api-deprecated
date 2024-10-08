import { FriendChannel } from "@furxus/types";
import UserSchema from "schemas/User";

export default {
    FriendChannel: {
        participants: async (parent: FriendChannel) =>
            UserSchema.find({
                id: { $in: parent.participants }
            }),
        messages: async (parent: FriendChannel) =>
            UserSchema.find({
                id: { $in: parent.messages }
            })
    }
};
