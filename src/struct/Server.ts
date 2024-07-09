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
import { graphqlUploadExpress } from "graphql-upload-ts";
import Auth from "./Auth";
import { NotAuthorizedError } from "./Errors";
import RequestLog from "../schemas/RequestLogs";

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

const serverCleanup = useServer(
    {
        schema,
        context: async (ctx) => {
            const auth = ctx.connectionParams?.auth as string | undefined;
            if (!auth) throw new NotAuthorizedError();
            const user = Auth.checkToken(auth);
            if (!user) throw new NotAuthorizedError();

            return { user };
        }
    },
    wsServer
);

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
            cors<cors.CorsRequest>({
                origin: ["http://localhost:5173"],
                credentials: true
            }),
            graphqlUploadExpress({
                maxFiles: 10,
                maxFileSize: 10000000
            }),
            express.json(),
            expressMiddleware(this, {
                context: async ({ req }) => {
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

                    if (!schema) schema = new RequestLog({ ips: [ip] });

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
                        if (typeof user === "string")
                            throw new NotAuthorizedError();

                        if (!schema.associatedUser)
                            schema.associatedUser = user.id;

                        await schema.save();

                        return { user };
                    }

                    return {};
                }
            })
        );

        app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });
    }
}
