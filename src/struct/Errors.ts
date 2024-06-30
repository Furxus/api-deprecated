import { GraphQLError } from "graphql";

export class NotAuthorizedError extends GraphQLError {
    constructor() {
        super("Not authorized to connect to the server", {
            extensions: {
                code: "UNAUTHORIZED",
                http: { status: 401 }
            }
        });
    }
}
