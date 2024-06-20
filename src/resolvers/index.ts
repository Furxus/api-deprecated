import { resolvers as scalarResolvers } from "graphql-scalars";
import users from "./users";

export default {
    ...scalarResolvers,
    Query: {
        pulse: () => "Pulse Check!",
        ...users.Query
    },
    Mutation: {
        ...users.Mutation
    }
};
