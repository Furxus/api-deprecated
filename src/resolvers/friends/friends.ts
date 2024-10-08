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

            // Store the friend request that the user has sent to user 2
            if (!userDoc.friendRequests?.sent.includes(userId)) {
                userDoc.friendRequests?.sent.push(userId);
            }

            // Store the friend request that user 2 has received from user 1
            if (!friendDoc.friendRequests?.received.includes(user.id)) {
                friendDoc.friendRequests?.received.push(user.id);
            }

            // Check if user 2 has sent a friend request to user 1, if so make them friends
            if (
                userDoc.friendRequests?.received.includes(userId) &&
                friendDoc.friendRequests?.sent.includes(user.id)
            ) {
                userDoc.friends.push(userId);
                friendDoc.friends.push(user.id);

                userDoc.friendRequests.received =
                    userDoc.friendRequests?.received.filter(
                        (friend) => friend !== userId
                    );
                friendDoc.friendRequests.sent =
                    friendDoc.friendRequests?.sent.filter(
                        (friend) => friend !== user.id
                    );
            }

            // Check if user 1 has sent a friend request to user 2, if so make them friends
            if (
                friendDoc.friendRequests?.received.includes(user.id) &&
                userDoc.friendRequests?.sent.includes(userId)
            ) {
                userDoc.friends.push(userId);
                friendDoc.friends.push(user.id);

                userDoc.friendRequests.sent =
                    userDoc.friendRequests?.sent.filter(
                        (friend) => friend !== userId
                    );
                friendDoc.friendRequests.received =
                    friendDoc.friendRequests?.received.filter(
                        (friend) => friend !== user.id
                    );
            }

            // Save the changes
            await userDoc.save();
            await friendDoc.save();

            return true;
        },
        acceptFriendRequest: async (
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

            // Make them friends
            userDoc.friends.push(userId);
            friendDoc.friends.push(user.id);

            // Check if user 1 has received a friend request to user 2, if so remove it
            // Check if user 1 has sent a friend request to user 2, if so remove it
            if (userDoc.friendRequests) {
                userDoc.friendRequests.received =
                    userDoc.friendRequests.received.filter(
                        (friend) => friend !== userId
                    );

                userDoc.friendRequests.sent =
                    userDoc.friendRequests.sent.filter(
                        (friend) => friend !== userId
                    );
            }

            // Check if user 2 has received a friend request to user 1, if so remove it
            // Check if user 2 has sent a friend request to user 1, if so remove it
            if (friendDoc.friendRequests) {
                friendDoc.friendRequests.received =
                    friendDoc.friendRequests?.sent.filter(
                        (friend) => friend !== user.id
                    );
                friendDoc.friendRequests.sent =
                    friendDoc.friendRequests?.sent.filter(
                        (friend) => friend !== user.id
                    );
            }

            await userDoc.save();
            await friendDoc.save();

            return true;
        },
        declineFriendRequest: async (
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

            if (userDoc.friendRequests?.received.includes(userId)) {
                userDoc.friendRequests.received =
                    userDoc.friendRequests.received.filter(
                        (friend) => friend !== userId
                    );
            }

            if (friendDoc.friendRequests?.sent.includes(user.id)) {
                friendDoc.friendRequests.sent =
                    friendDoc.friendRequests.sent.filter(
                        (friend) => friend !== user.id
                    );
            }

            await userDoc.save();
            await friendDoc.save();

            return true;
        },
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
