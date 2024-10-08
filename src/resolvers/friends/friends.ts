import { User } from "@furxus/types";
import { GraphQLError } from "graphql";
import UserSchema from "schemas/User";
import FriendChannelSchema from "schemas/FriendChannel";

export default {
    Query: {
        getFriends: async (_: any, __: any, { user }: { user: User }) => {
            const userDoc = await UserSchema.findOne({
                id: user.id
            });

            if (!userDoc)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            return userDoc.friends;
        },
        getFriendChannels: async (_: any, __: any, { user }: { user: User }) =>
            FriendChannelSchema.find({
                $in: { participants: user.id }
            })
    },
    Mutation: {
        sendFriendRequest: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({
                id: user.id
            });

            if (!userDoc)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            const friendDoc = await UserSchema.findOne({
                id: userId
            });

            if (!friendDoc)
                throw new GraphQLError("Friend not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend not found"
                            }
                        ]
                    }
                });

            if (userDoc.friends.includes(userId))
                throw new GraphQLError("Already friends", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Already friends"
                            }
                        ]
                    }
                });

            if (
                userDoc.friendRequests?.sent.includes(userId) &&
                friendDoc.friendRequests?.sent.includes(user.id)
            ) {
                userDoc.friends.push(userId);
                friendDoc.friends.push(user.id);

                userDoc.friendRequests.sent =
                    userDoc.friendRequests.sent.filter(
                        (friend) => friend !== userId
                    );
                friendDoc.friendRequests.sent =
                    friendDoc.friendRequests.sent.filter(
                        (friend) => friend !== user.id
                    );

                await userDoc.save();
                await friendDoc.save();

                return true;
            }

            if (!userDoc.friendRequests?.sent.includes(userId)) {
                userDoc.friendRequests?.sent.push(userId);
                await userDoc.save();
            }

            if (!friendDoc.friendRequests?.received.includes(user.id)) {
                friendDoc.friendRequests?.received.push(user.id);
                await friendDoc.save();
            }

            return true;
        },
        acceptFriendRequest: (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {},
        declineFriendRequest: (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {},
        removeFriend: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({
                id: user.id
            });

            if (!userDoc)
                throw new GraphQLError("User not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User not found"
                            }
                        ]
                    }
                });

            const friendDoc = await UserSchema.findOne({
                id: userId
            });

            if (!friendDoc)
                throw new GraphQLError("Friend not found", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend not found"
                            }
                        ]
                    }
                });

            userDoc.friends = userDoc.friends.filter(
                (friend) => friend !== userId
            );
            friendDoc.friends = friendDoc.friends.filter(
                (friend) => friend !== user.id
            );

            await userDoc.save();
            await friendDoc.save();

            return true;
        }
    }
};
