import { GraphQLError } from "graphql";
import PostSchema from "schemas/posts/Post";
import { genSnowflake } from "struct/Server";

export default {
    Query: {
        getPosts: async () => (await PostSchema.find()).toSorted((a, b) => a.createdTimestamp - b.createdTimestamp),
        getPost: async (_: any, { id }: { id: string})  => {
            const post = await PostSchema.findOne({
                id
            });

            if(!post) throw new GraphQLError("Post not found", {
                extensions: {
                    errors: [
                        {
                            type: "post",
                            message: "Post not found."
                        }
                    ]
                }
            });

            return post;
        }
    },
    Mutation: {
        createPost:async  (_: any, { text, media }: { text?: string; media?: any }) => {
            let mediaFile = null;
            try {
                if(media) {
                    mediaFile = await media;
                }
            } catch(error) {
                throw new GraphQLError(
                    "An error occurred while uploading the media.",
                    {
                        extensions: {
                            errors: [
                                {
                                    type: "icon",
                                    message:
                                        "An error occurred while uploading the media."
                                }
                            ]
                        }
                    }
                );
            }

            const post = new PostSchema({
                id: genSnowflake(),
                createdAt: new Date(),
            });
        }
    }
};