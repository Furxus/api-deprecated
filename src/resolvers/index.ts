import { resolvers as scalarResolvers } from "graphql-scalars";
import users from "./users";

export default {
    ...scalarResolvers,
    Query: {
        pulse: () => true,
        ...users.Query
    },
    Mutation: {
        ...users.Mutation
    }
};
