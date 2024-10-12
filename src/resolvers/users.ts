import { User } from "@furxus/types";
import { pubSub } from "struct/Server";
import ChannelSchema from "schemas/servers/Channel";
import UserSchema from "schemas/User";
import { GraphQLError } from "graphql";
import { withFilter } from "graphql-subscriptions";

export enum UserEvents {
    FriendRequestSent = "FRIEND_REQUEST_SENT",
    UserUpdated = "USER_UPDATED"
}

export default {
    Query: {
        getDMChannels: async (_: any, __: any, { user }: { user: User }) =>
            ChannelSchema.find({
                type: "dm",
                $in: { participants: user.id }
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

            if (!targetUser)
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
