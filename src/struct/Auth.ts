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
    // Checking JWT token with decrypting it
    static checkToken(token: string) {
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

            logger.error(err);
        }
    }
}
