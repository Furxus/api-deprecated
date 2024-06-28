import { resolvers as scalarResolvers } from "graphql-scalars";
import users from "./users";
import servers from "./servers";

export default {
    ...scalarResolvers,
    Query: {
        apiStatus: () => true,
        ...servers.Query,
        ...users.Query
    },
    Mutation: {
        ...servers.Mutation,
        ...users.Mutation
    }
};
