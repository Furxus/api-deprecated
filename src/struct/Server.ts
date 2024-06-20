import express from "express";
import cors from "cors";
import helmet from "helmet";

import gql from "graphql-tag";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { expressMiddleware } from "@apollo/server/express4";
import resolvers from "../resolvers";
import { readFileSync } from "fs";
import { ApolloServerPluginInlineTraceDisabled } from "@apollo/server/plugin/disabled";
import Database from "./Database";
import logger from "./Logger";
import inheritDirective from "graphql-inherits";

const port = process.env.PORT || 4000;
const app = express();

import { typeDefs as scalarTypeDefs } from "graphql-scalars";

const typeDefs = gql(
    readFileSync("src/schema.graphql", {
        encoding: "utf-8"
    })
);

export default class Server extends ApolloServer {
    readonly database: Database;

    constructor() {
        super({
            schema: inheritDirective(
                buildSubgraphSchema({
                    typeDefs: {
                        ...scalarTypeDefs,
                        ...typeDefs
                    },
                    resolvers
                }),
                "inherits"
            ),
            plugins: [ApolloServerPluginInlineTraceDisabled()]
        });

        this.database = new Database();
    }

    async start() {
        await this.database.connect();
        await super.start();
        app.use(helmet());
        app.use(
            "/",
            cors(),
            express.json(),
            expressMiddleware(this, {
                context: async ({ req }) => ({ req })
            })
        );
        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    }
}
