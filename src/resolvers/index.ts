import users from "./users";
import { DateScalar } from "../scalars";

export default {
    Date: DateScalar,
    Query: {
        pulse: () => "Pulse Check!",
        ...users.Query
    },
    Mutation: {
        ...users.Mutation
    }
};
