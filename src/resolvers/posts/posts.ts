import { User } from "@furxus/types";
import { GraphQLError } from "graphql";
import PostSchema from "schemas/posts/Post";
import { genSnowflake, pubSub } from "struct/Server";
import asset from "struct/AssetManagement";

enum PostEvents {
    PostCreated = "POST_CREATED",
    PostDeleted = "POST_DELETED"
}

export default {
    Query: {
        getPosts: async () =>
            (await PostSchema.find()).toSorted(
                (a, b) => a.createdTimestamp - b.createdTimestamp
            ),

        getPaginatedPosts: async (_: any, { page }: { page: number }) => {
            const posts = (await PostSchema.find()).toSorted(
                (a, b) => a.createdTimestamp - b.createdTimestamp
            );

            if (!posts) return [];

            return posts.slice(page * 10, page * 5 + 10);
        },
        getPost: async (_: any, { id }: { id: string }) => {
            const post = await PostSchema.findOne({
                id
            });

            if (!post)
                throw new GraphQLError("Post not found", {
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
        createPost: async (
            _: any,
            { content }: { text?: string; content?: any },
            { user }: { user: User }
        ) => {
            const { text, media } = content;

            let mediaFile = null;
            try {
                if (media) {
                    mediaFile = await media;
                }
            } catch (_) {
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
                user: user.id,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            if (!post.content)
                post.content = {
                    text: "",
                    image: "",
                    video: "",
                    audio: ""
                };

            if (text) post.content.text = text;
            if (mediaFile) {
                const stream = mediaFile.createReadStream();
                const mediaExtension = mediaFile.mimetype.split("/")[1];
                const mediaUrl = await asset.uploadStream(
                    stream,
                    `posts/${user.id}/${post.id}/${genSnowflake()}.${mediaExtension}`
                );

                if (mediaUrl) {
                    const pubUrl = mediaUrl.publicUrls[0];

                    switch (mediaFile.mimetype.split("/")[0]) {
                        case "image":
                            post.content.image = pubUrl;
                            break;
                        case "video":
                            post.content.video = pubUrl;
                            break;
                        case "audio":
                            post.content.audio = pubUrl;
                            break;
                    }
                }
            }

            await pubSub.publish(PostEvents.PostCreated, {
                postCreated: post
            });

            await post.save();

            return post;
        }
    },
    Subscription: {
        postCreated: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostCreated)
        },
        postDeleted: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostDeleted)
        }
    }
};
