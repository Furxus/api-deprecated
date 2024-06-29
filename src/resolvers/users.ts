import UserModel from "../schemas/User";

export default {
    Query: {
        getUser: async (_: any, { id }: { id: string }) => {
            const user = await UserModel.findOne({ id });
            if (!user) throw new Error("User not found");
            return user;
        },
        getUsers: async () => {
            return await UserModel.find();
        }
    },
    Mutation: {}
};
