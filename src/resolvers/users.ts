import { User } from "@furxus/types";
import { pubSub } from "struct/Server";
import UserSchema from "schemas/User";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";

export enum UserEvents {
    FriendRequestSent = "FRIEND_REQUEST_SENT",
    UserUpdated = "USER_UPDATED"
}

export default {
    Query: {
        getUser: async (_: any, { id }: { id: string }) =>
            UserSchema.findOne({
                id
            })
    },
    Mutation: {
        sendFriendRequest: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({ id: user.id });
            const targetUser = await UserSchema.findOne({ id: userId });

            if (!userDoc || !targetUser)
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

            if (userDoc.id === targetUser.id)
                throw new GraphQLError(
                    "Cannot send friend request to yourself",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "user",
                                    message:
                                        "Cannot send friend request to yourself"
                                }
                            ]
                        }
                    }
                );

            if (userDoc.friends?.includes(userId))
                throw new GraphQLError("User is already a friend", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User is already a friend"
                            }
                        ]
                    }
                });

            if (userDoc.friendRequests?.sent.includes(userId))
                throw new GraphQLError("Friend request already sent", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request already sent"
                            }
                        ]
                    }
                });

            if (userDoc.friendRequests?.received.includes(userId))
                throw new GraphQLError("Friend request already received", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request already received"
                            }
                        ]
                    }
                });

            userDoc.friendRequests?.sent.push(userId);
            targetUser.friendRequests?.received.push(user.id);

            await userDoc.save();
            await targetUser.save();

            pubSub.publish(UserEvents.UserUpdated, {
                userUpdated: userDoc
            });

            return true;
        },
        cancelFriendRequest: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({ id: user.id });
            const targetUser = await UserSchema.findOne({ id: userId });

            if (!userDoc || !targetUser)
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

            if (!userDoc.friendRequests?.sent.includes(userId))
                throw new GraphQLError("Friend request not sent", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request not sent"
                            }
                        ]
                    }
                });

            if (!targetUser.friendRequests?.received.includes(user.id))
                throw new GraphQLError("Friend request not received", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request not received"
                            }
                        ]
                    }
                });

            userDoc.friendRequests.sent = userDoc.friendRequests.sent.filter(
                (id) => id !== userId
            );
            targetUser.friendRequests.received =
                targetUser.friendRequests?.received.filter(
                    (id) => id !== user.id
                );

            await userDoc.save();
            await targetUser.save();

            pubSub.publish(UserEvents.UserUpdated, {
                userUpdated: userDoc
            });

            return true;
        },
        acceptFriendRequest: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({ id: user.id });
            const targetUser = await UserSchema.findOne({ id: userId });

            if (!userDoc || !targetUser)
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

            if (!userDoc.friendRequests?.received.includes(userId))
                throw new GraphQLError("Friend request not received", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request not received"
                            }
                        ]
                    }
                });

            if (!targetUser.friendRequests?.sent.includes(user.id))
                throw new GraphQLError("Friend request not sent", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "Friend request not sent"
                            }
                        ]
                    }
                });

            userDoc.friendRequests.received =
                userDoc.friendRequests.received.filter((id) => id !== userId);
            targetUser.friendRequests.sent =
                targetUser.friendRequests.sent.filter((id) => id !== user.id);

            userDoc.friends.push(userId);
            targetUser.friends.push(user.id);

            await userDoc.save();
            await targetUser.save();

            pubSub.publish(UserEvents.UserUpdated, {
                userUpdated: userDoc
            });

            return true;
        },
        removeFriend: async (
            _: any,
            { userId }: { userId: string },
            { user }: { user: User }
        ) => {
            const userDoc = await UserSchema.findOne({ id: user.id });
            const targetUser = await UserSchema.findOne({ id: userId });

            if (!userDoc || !targetUser)
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

            if (!userDoc.friends.includes(userId))
                throw new GraphQLError("User is not a friend", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User is not a friend"
                            }
                        ]
                    }
                });

            if (!targetUser.friends.includes(user.id))
                throw new GraphQLError("User is not a friend", {
                    extensions: {
                        errors: [
                            {
                                type: "user",
                                message: "User is not a friend"
                            }
                        ]
                    }
                });

            userDoc.friends = userDoc.friends.filter((id) => id !== userId);
            targetUser.friends = targetUser.friends.filter(
                (id) => id !== user.id
            );

            await userDoc.save();
            await targetUser.save();

            pubSub.publish(UserEvents.UserUpdated, {
                userUpdated: userDoc
            });

            return true;
        }
    },
    Subscription: {
        userUpdated: {
            subscribe: () => pubSub.asyncIterator(UserEvents.UserUpdated)
        },
        friendRequestSent: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(UserEvents.FriendRequestSent),
                (payload, variables) =>
                    payload.friendRequestSent.userId === variables.userId ||
                    payload.friendRequestSent.targetUserId === variables.userId
            )
        }
    }
};
