import { resolvers as scalarResolvers } from "graphql-scalars";
import users from "./users";

export default {
    ...scalarResolvers,
    Query: {
        apiStatus: () => true,
        ...users.Query
    },
    Mutation: {
        ...users.Mutation
    }
};
