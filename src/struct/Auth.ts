import jwt, {
    TokenExpiredError,
    JsonWebTokenError,
    NotBeforeError
} from "jsonwebtoken";
import { decrypt } from "./Crypt";
import logger from "./Logger";
import { User } from "@furxus/types";

const { JWT_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("No JWT secret provided");

export default class Auth {
    // Checking JWT token with decrypting it
    static checkToken(token: string): User | null {
        try {
            // verify token
            return jwt.verify(decrypt(token), JWT_SECRET!) as User;
        } catch (err) {
            if (
                err instanceof TokenExpiredError ||
                err instanceof JsonWebTokenError ||
                err instanceof NotBeforeError
            ) {
                logger.error(err.message);
                throw new Error("Session timed out, please log in again");
            }

            logger.error(err);
        }

        return null;
    }
}
