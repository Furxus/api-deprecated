import express from "express";
import cors from "cors";
import helmet from "helmet";

import gql from "graphql-tag";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import resolvers from "../resolvers";
import { readFileSync } from "fs";
import { ApolloServerPluginInlineTraceDisabled } from "@apollo/server/plugin/disabled";
import Database from "./Database";
import logger from "./Logger";
import inheritDirective from "graphql-inherits";
import { typeDefs as scalarTypeDefs } from "graphql-scalars";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

const port = process.env.PORT || 1125;
const app = express();

const httpServer = createServer(app);

const typeDefs = gql(
    readFileSync("src/schema.graphql", {
        encoding: "utf-8"
    })
);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/ws"
});

const schema = inheritDirective(
    makeExecutableSchema({
        typeDefs: {
            ...scalarTypeDefs,
            ...typeDefs
        },
        resolvers
    }),
    "inherits"
);

const serverCleanup = useServer({ schema }, wsServer);

export default class Server extends ApolloServer {
    readonly database: Database;

    constructor() {
        super({
            schema,
            plugins: [
                ApolloServerPluginInlineTraceDisabled(),
                ApolloServerPluginDrainHttpServer({ httpServer }),
                {
                    async serverWillStart() {
                        return {
                            async drainServer() {
                                await serverCleanup.dispose();
                            }
                        };
                    }
                }
            ]
        });

        this.database = new Database();
    }

    async start() {
        await this.database.connect();
        await super.start();
        app.use(helmet());
        app.use(
            "/",
            cors<cors.CorsRequest>(),
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
