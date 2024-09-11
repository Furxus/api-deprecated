import express from "express";
import cors from "cors";
import helmet from "helmet";

import gql from "graphql-tag";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import resolvers from "../resolvers";
import { readFileSync } from "fs";
import Database from "./Database";
import logger from "./Logger";
import inheritDirective from "graphql-inherits";
import { typeDefs as scalarTypeDefs } from "graphql-scalars";
import { createServer } from "http";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { graphqlUploadExpress } from "graphql-upload-ts";
import Auth from "./Auth";
import { NotAuthorizedError } from "./Errors";
import RequestLog from "../schemas/RequestLogs";
import { PubSub } from "graphql-subscriptions";
import { MongodbPubSub } from "graphql-mongodb-subscriptions";
import { Db, MongoClient } from "mongodb";
import { Snowflake } from "@theinternetfolks/snowflake";
import { threadId } from "worker_threads";
import * as postMark from "postmark";

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
    path: "/"
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

const serverCleanup = useServer(
    {
        schema,
        context: async ({ connectionParams: params }) => {
            if (!params) throw new NotAuthorizedError();
            const header = params?.Authorization as string | undefined;
            if (!header) throw new NotAuthorizedError();
            const token = header.split(" ")[1];
            const user = Auth.checkToken(token);
            if (!user) throw new NotAuthorizedError();

            return { user };
        },
        onConnect: async ({ connectionParams: params }) => {
            if (!params) throw new NotAuthorizedError();
            const header = params?.Authorization as string | undefined;
            if (!header) throw new NotAuthorizedError();
            const token = header.split(" ")[1];
            const user = Auth.checkToken(token);
            if (!user) throw new NotAuthorizedError();

            return { user };
        }
    },
    wsServer
);

const genSnowflake = () =>
    Snowflake.generate({ timestamp: 1731283200, shard_id: threadId });

let pubSub: PubSub | MongodbPubSub = new PubSub();
if (process.env.NODE_ENV !== "development") {
    pubSub = new MongodbPubSub({
        connectionDb: new Db(
            new MongoClient(process.env.DATABASE ?? ""),
            "furxus"
        ),
        channelOptions: {
            size: 100000000000000,
            max: 100000000000000
        }
    });
}

const postmark = new postMark.ServerClient(process.env.POSTMARK_KEY ?? "");

export { pubSub, genSnowflake, postmark };

export default class Server extends ApolloServer {
    readonly database: Database;

    constructor() {
        super({
            schema,
            plugins: [
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
            cors<cors.CorsRequest>({
                origin: "*"
            }),
            graphqlUploadExpress({
                maxFiles: 10,
                maxFileSize: 26214400
            }),
            express.json(),
            expressMiddleware(this, {
                context: async ({ req }) => {
                    // IP Logging and User Agent Logging (for security purposes and banning if needed, we don't store any personal data and will never use this maliciously)
                    let ip =
                        req.headers["x-forwarded-for"] ||
                        req.socket.remoteAddress;

                    if (ip) {
                        ip = ip.toString();
                        if (ip.startsWith("::ffff:")) ip = ip.substring(7);
                    }

                    const userAgent = req.headers["user-agent"];
                    const acceptLanguage = req.headers["accept-language"];

                    let schema = await RequestLog.findOne({
                        ips: { $in: [ip] }
                    });

                    if (!schema)
                        schema = new RequestLog({
                            ips: [ip],
                            firstRequest: new Date(),
                            firstRequestTimestamp: Date.now()
                        });

                    if (ip && !schema.ips.includes(ip)) schema.ips.push(ip);

                    if (userAgent && !schema.agents.includes(userAgent))
                        schema.agents.push(userAgent);

                    if (
                        acceptLanguage &&
                        !schema.languages.includes(acceptLanguage)
                    )
                        schema.languages.push(acceptLanguage);

                    await schema.save();

                    const token =
                        req.headers.authorization?.split(" ")[1] || null;

                    if (token) {
                        const user = Auth.checkToken(token);
                        if (!user) throw new NotAuthorizedError();

                        if (!schema.associatedUsers.includes(user.id))
                            schema.associatedUsers.push(user.id);

                        await schema.save();

                        return { user };
                    }

                    return { user: null };
                }
            })
        );

        httpServer.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    }
}
