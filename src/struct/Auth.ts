import { Request } from "express";
import jwt, {
    TokenExpiredError,
    JsonWebTokenError,
    NotBeforeError
} from "jsonwebtoken";
import { decrypt } from "./Crypt";
import logger from "./Logger";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("No JWT secret provided");

export default class Auth {
    static checkToken(req: Request) {
        const header = req.headers.authorization;
        if (!header) throw new Error("You must be logged in");
        const token = header.split("Bearer ")[1];
        if (!token)
            throw new Error("Authentication token must be 'Bearer [token]'");

        try {
            // verify token
            return jwt.verify(decrypt(token), JWT_SECRET!);
        } catch (err) {
            if (
                err instanceof TokenExpiredError ||
                err instanceof JsonWebTokenError ||
                err instanceof NotBeforeError
            ) {
                logger.error(err.message);
                throw new Error("Session timed out, please log in again");
            }
        }
    }
}
