import { resolvers as scalarResolvers } from "graphql-scalars";
import { GraphQLUpload } from "graphql-upload-ts";
import users from "./users";
import servers from "./servers";
import auth from "./auth";
import { Resolvers } from "types/graphql";

export default {
    ...scalarResolvers,
    Upload: GraphQLUpload,
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
} as Resolvers;
