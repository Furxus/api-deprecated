import { pubSub } from "struct/Server";

export enum UserEvents {
    UserUpdated = "USER_UPDATED"
}

export default {
    Query: {},
    Mutation: {},
    Subscription: {
        userUpdated: {
            subscribe: () => pubSub.asyncIterator(UserEvents.UserUpdated)
        }
    }
};
