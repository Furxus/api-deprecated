import { User } from "@furxus/types";
import { GraphQLError } from "graphql";
import PostSchema from "schemas/posts/Post";
import { genSnowflake, pubSub } from "struct/Server";
import asset from "struct/AssetManagement";
import CommentSchema from "schemas/posts/Comment";
import { withFilter } from "graphql-subscriptions";

enum PostEvents {
    PostCreated = "POST_CREATED",
    PostDeleted = "POST_DELETED",
    PostLiked = "POST_LIKED",
    PostUnliked = "POST_UNLIKED",
    CommentCreated = "COMMENT_CREATED"
}

export default {
    Query: {
        getPosts: async () =>
            (await PostSchema.find()).toSorted(
                (a, b) => b.createdTimestamp - a.createdTimestamp
            ),

        getPaginatedPosts: async (
            _: any,
            { offset, limit = 10 }: { offset: number; limit?: number }
        ) => {
            const posts = (await PostSchema.find()).toSorted(
                (a, b) => b.createdTimestamp - a.createdTimestamp
            );

            if (!posts) return [];

            return posts.slice(offset, offset + limit);
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
        },
        getComments: async (_: any, { postId }: { postId: string }) => {
            const post = await PostSchema.findOne({
                id: postId
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

            return (
                await CommentSchema.find({
                    id: { $in: post.comments }
                })
            ).toSorted((a, b) => b.createdTimestamp - a.createdTimestamp);
        },

        getCommentCount: async (_: any, { postId }: { postId: string }) => {
            const post = await PostSchema.findOne({
                id: postId
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

            return post.comments.length;
        },
        getPaginatedComments: async (
            _: any,
            { postId, offset }: { postId: string; offset: number }
        ) => {
            const post = await PostSchema.findOne({
                id: postId
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

            const comments = (
                await CommentSchema.find({
                    id: { $in: post.comments }
                })
            ).toSorted((a, b) => a.createdTimestamp - b.createdTimestamp);

            if (!comments) return [];

            return comments.slice(offset, offset + 10);
        }
    },
    Mutation: {
        createPost: async (
            _: any,
            { content }: { text?: string; content?: any },
            { user }: { user: User }
        ) => {
            if (!content.text && !content.media)
                throw new GraphQLError("Post cannot be empty.", {
                    extensions: {
                        errors: [
                            {
                                type: "content",
                                message: "Post cannot be empty."
                            }
                        ]
                    }
                });

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
        },
        likePost: async (
            _: any,
            { postId }: { postId: string },
            { user }: { user: User }
        ) => {
            const post = await PostSchema.findOne({
                id: postId
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

            if (post.likes.includes(user.id))
                throw new GraphQLError("Post already liked.", {
                    extensions: {
                        errors: [
                            {
                                type: "post",
                                message: "Post already liked."
                            }
                        ]
                    }
                });

            post.likes.push(user.id);

            await pubSub.publish(PostEvents.PostLiked, {
                postLiked: post
            });

            await post.save();

            return post;
        },
        unlikePost: async (
            _: any,
            { postId }: { postId: string },
            { user }: { user: User }
        ) => {
            const post = await PostSchema.findOne({
                id: postId
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

            if (!post.likes.includes(user.id))
                throw new GraphQLError("Post not liked.", {
                    extensions: {
                        errors: [
                            {
                                type: "post",
                                message: "Post not liked."
                            }
                        ]
                    }
                });

            post.likes = post.likes.filter((like) => like !== user.id);

            await pubSub.publish(PostEvents.PostUnliked, {
                postUnliked: post
            });

            await post.save();

            return post;
        },
        createComment: async (
            _: any,
            { postId, content }: { postId: string; content: string },
            { user }: { user: User }
        ) => {
            const post = await PostSchema.findOne({ id: postId });
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

            const comment = new CommentSchema({
                id: genSnowflake(),
                user: user.id,
                post: post.id,
                content,
                createdAt: new Date(),
                createdTimestamp: Date.now()
            });

            post.comments.push(comment.id);

            await post.save();
            await comment.save();

            await pubSub.publish(PostEvents.CommentCreated, {
                commentCreated: comment
            });

            return comment;
        }
    },
    Subscription: {
        postCreated: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostCreated)
        },
        postDeleted: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostDeleted)
        },
        postLiked: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostLiked)
        },
        postUnliked: {
            subscribe: () => pubSub.asyncIterator(PostEvents.PostUnliked)
        },
        commentCreated: {
            subscribe: withFilter(
                () => pubSub.asyncIterator(PostEvents.CommentCreated),
                async (payload, variables) =>
                    payload.commentCreated.post === variables.postId
            )
        }
    }
};
