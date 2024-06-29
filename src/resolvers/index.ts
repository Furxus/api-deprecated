import { resolvers as scalarResolvers } from "graphql-scalars";
import users from "./users";
import servers from "./servers";
import auth from "./auth";

export default {
    ...scalarResolvers,
    Query: {
        apiStatus: () => true,
        ...servers.Query,
        ...users.Query
    },
    Mutation: {
        ...auth.Mutation,
        ...servers.Mutation,
        ...users.Mutation
    }
};
