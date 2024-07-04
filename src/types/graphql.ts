/* eslint-disable @typescript-eslint/ban-types */

import {
    GraphQLResolveInfo,
    GraphQLScalarType,
    GraphQLScalarTypeConfig
} from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
    T extends { [key: string]: unknown },
    K extends keyof T
> = { [_ in K]?: never };
export type Incremental<T> =
    | T
    | {
          [P in keyof T]?: P extends " $fragmentName" | "__typename"
              ? T[P]
              : never;
      };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string };
    String: { input: string; output: string };
    Boolean: { input: boolean; output: boolean };
    Int: { input: number; output: number };
    Float: { input: number; output: number };
    AccountNumber: { input: any; output: any };
    Any: { input: any; output: any };
    BigInt: { input: any; output: any };
    Byte: { input: any; output: any };
    CountryCode: { input: any; output: any };
    Cuid: { input: any; output: any };
    Currency: { input: any; output: any };
    DID: { input: any; output: any };
    Date: { input: any; output: any };
    DateTime: { input: any; output: any };
    DateTimeISO: { input: any; output: any };
    DeweyDecimal: { input: any; output: any };
    Duration: { input: any; output: any };
    EmailAddress: { input: any; output: any };
    GUID: { input: any; output: any };
    HSL: { input: any; output: any };
    HSLA: { input: any; output: any };
    HexColorCode: { input: any; output: any };
    Hexadecimal: { input: any; output: any };
    IBAN: { input: any; output: any };
    IP: { input: any; output: any };
    IPCPatent: { input: any; output: any };
    IPv4: { input: any; output: any };
    IPv6: { input: any; output: any };
    ISBN: { input: any; output: any };
    ISO8601Duration: { input: any; output: any };
    JSON: { input: any; output: any };
    JSONObject: { input: any; output: any };
    JWT: { input: any; output: any };
    LCCSubclass: { input: any; output: any };
    Latitude: { input: any; output: any };
    LocalDate: { input: any; output: any };
    LocalDateTime: { input: any; output: any };
    LocalEndTime: { input: any; output: any };
    LocalTime: { input: any; output: any };
    Locale: { input: any; output: any };
    Long: { input: any; output: any };
    Longitude: { input: any; output: any };
    MAC: { input: any; output: any };
    NegativeFloat: { input: any; output: any };
    NegativeInt: { input: any; output: any };
    NonEmptyString: { input: any; output: any };
    NonNegativeFloat: { input: any; output: any };
    NonNegativeInt: { input: any; output: any };
    NonPositiveFloat: { input: any; output: any };
    NonPositiveInt: { input: any; output: any };
    ObjectID: { input: any; output: any };
    PhoneNumber: { input: any; output: any };
    Port: { input: any; output: any };
    PositiveFloat: { input: any; output: any };
    PositiveInt: { input: any; output: any };
    PostalCode: { input: any; output: any };
    RGB: { input: any; output: any };
    RGBA: { input: any; output: any };
    RoutingNumber: { input: any; output: any };
    SESSN: { input: any; output: any };
    SafeInt: { input: any; output: any };
    SemVer: { input: any; output: any };
    Time: { input: any; output: any };
    TimeZone: { input: any; output: any };
    Timestamp: { input: any; output: any };
    URL: { input: any; output: any };
    USCurrency: { input: any; output: any };
    UUID: { input: any; output: any };
    UnsignedFloat: { input: any; output: any };
    UnsignedInt: { input: any; output: any };
    Upload: { input: any; output: any };
    UtcOffset: { input: any; output: any };
    Void: { input: any; output: any };
};

export type Activity = {
    __typename?: "Activity";
    id: Scalars["String"]["output"];
    lastActive: Scalars["DateTime"]["output"];
    lastActiveTimestamp: Scalars["Timestamp"]["output"];
    text: Scalars["String"]["output"];
};

export type Auth = {
    __typename?: "Auth";
    token: Scalars["JWT"]["output"];
};

export type Channel = {
    __typename?: "Channel";
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    id: Scalars["String"]["output"];
    messages: Array<Maybe<Message>>;
    name: Scalars["String"]["output"];
    nsfw: Scalars["Boolean"]["output"];
    position: Scalars["Int"]["output"];
    server: Server;
    topic?: Maybe<Scalars["String"]["output"]>;
    type: Scalars["String"]["output"];
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
};

export type Comment = {
    __typename?: "Comment";
    content: Scalars["String"]["output"];
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    id: Scalars["String"]["output"];
    likes: Array<Maybe<User>>;
    post: Post;
    reports: Array<Maybe<Report>>;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
};

export type LoginInput = {
    password: Scalars["String"]["input"];
    usernameOrEmail: Scalars["String"]["input"];
};

export type Member = {
    __typename?: "Member";
    id: Scalars["String"]["output"];
    joinedAt: Scalars["DateTime"]["output"];
    joinedTimestamp: Scalars["Timestamp"]["output"];
    permissions: Array<Maybe<Scalars["String"]["output"]>>;
    roles: Array<Maybe<Role>>;
    server: Server;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
    user: User;
};

export type Message = {
    __typename?: "Message";
    channel: Channel;
    content: Scalars["String"]["output"];
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    id: Scalars["String"]["output"];
    member: Member;
    server: Server;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
};

export type Mutation = {
    __typename?: "Mutation";
    addMember: Member;
    blockUser: Scalars["Boolean"]["output"];
    createChannel: Channel;
    createComment: Comment;
    createMessage: Message;
    createPost: Post;
    createRole: Role;
    createServer: Server;
    deleteChannel: Scalars["Boolean"]["output"];
    deleteComment: Scalars["Boolean"]["output"];
    deleteMessage: Scalars["Boolean"]["output"];
    deletePost: Scalars["Boolean"]["output"];
    deleteRole: Scalars["Boolean"]["output"];
    deleteServer: Scalars["Boolean"]["output"];
    followUser: Scalars["Boolean"]["output"];
    likeComment: Scalars["Boolean"]["output"];
    likePost: Scalars["Boolean"]["output"];
    loginUser: Auth;
    registerUser: Scalars["Boolean"]["output"];
    removeMember: Scalars["Boolean"]["output"];
    reportComment: Scalars["Boolean"]["output"];
    reportPost: Scalars["Boolean"]["output"];
    reportUser: Scalars["Boolean"]["output"];
    unblockUser: Scalars["Boolean"]["output"];
    unfollowUser: Scalars["Boolean"]["output"];
    unlikeComment: Scalars["Boolean"]["output"];
    unlikePost: Scalars["Boolean"]["output"];
    updateActivity: Activity;
    updateChannel: Channel;
    updateComment: Comment;
    updateMember: Member;
    updateMessage: Message;
    updatePost: Post;
    updateRole: Role;
    updateServer: Server;
    updateUser: User;
};

export type MutationAddMemberArgs = {
    serverId: Scalars["String"]["input"];
    userId: Scalars["String"]["input"];
};

export type MutationBlockUserArgs = {
    userId: Scalars["String"]["input"];
};

export type MutationCreateChannelArgs = {
    name: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationCreateCommentArgs = {
    content: Scalars["String"]["input"];
    mentions: Array<InputMaybe<Scalars["String"]["input"]>>;
    postId: Scalars["String"]["input"];
};

export type MutationCreateMessageArgs = {
    channelId: Scalars["String"]["input"];
    content: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationCreatePostArgs = {
    content: PostContentInput;
    hashtags: Array<InputMaybe<Scalars["String"]["input"]>>;
    mentions: Array<InputMaybe<Scalars["String"]["input"]>>;
    nsfw?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationCreateRoleArgs = {
    name: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationCreateServerArgs = {
    icon?: InputMaybe<Scalars["Upload"]["input"]>;
    name: Scalars["String"]["input"];
};

export type MutationDeleteChannelArgs = {
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationDeleteCommentArgs = {
    id: Scalars["String"]["input"];
};

export type MutationDeleteMessageArgs = {
    channelId: Scalars["String"]["input"];
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationDeletePostArgs = {
    id: Scalars["String"]["input"];
};

export type MutationDeleteRoleArgs = {
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationDeleteServerArgs = {
    id: Scalars["String"]["input"];
};

export type MutationFollowUserArgs = {
    userId: Scalars["String"]["input"];
};

export type MutationLikeCommentArgs = {
    commentId: Scalars["String"]["input"];
};

export type MutationLikePostArgs = {
    postId: Scalars["String"]["input"];
};

export type MutationLoginUserArgs = {
    input: LoginInput;
};

export type MutationRegisterUserArgs = {
    input: RegisterInput;
};

export type MutationRemoveMemberArgs = {
    serverId: Scalars["String"]["input"];
    userId: Scalars["String"]["input"];
};

export type MutationReportCommentArgs = {
    commentId: Scalars["String"]["input"];
};

export type MutationReportPostArgs = {
    postId: Scalars["String"]["input"];
};

export type MutationReportUserArgs = {
    userId: Scalars["String"]["input"];
};

export type MutationUnblockUserArgs = {
    userId: Scalars["String"]["input"];
};

export type MutationUnfollowUserArgs = {
    userId: Scalars["String"]["input"];
};

export type MutationUnlikeCommentArgs = {
    commentId: Scalars["String"]["input"];
};

export type MutationUnlikePostArgs = {
    postId: Scalars["String"]["input"];
};

export type MutationUpdateActivityArgs = {
    status?: InputMaybe<Scalars["String"]["input"]>;
    text?: InputMaybe<Scalars["String"]["input"]>;
    userId: Scalars["String"]["input"];
};

export type MutationUpdateChannelArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
    serverId: Scalars["String"]["input"];
};

export type MutationUpdateCommentArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
};

export type MutationUpdateMemberArgs = {
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
    serverId: Scalars["String"]["input"];
    userId: Scalars["String"]["input"];
};

export type MutationUpdateMessageArgs = {
    channelId: Scalars["String"]["input"];
    content: Scalars["String"]["input"];
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type MutationUpdatePostArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
};

export type MutationUpdateRoleArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
    serverId: Scalars["String"]["input"];
};

export type MutationUpdateServerArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
};

export type MutationUpdateUserArgs = {
    id: Scalars["String"]["input"];
    propertyNames: Array<Scalars["String"]["input"]>;
    propertyValues: Array<Scalars["Any"]["input"]>;
};

export type Post = {
    __typename?: "Post";
    comments: Array<Maybe<Comment>>;
    content: PostContent;
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    favorites: Array<Maybe<User>>;
    hashtags: Array<Maybe<Scalars["String"]["output"]>>;
    id: Scalars["String"]["output"];
    isPinned: Scalars["Boolean"]["output"];
    likes: Array<Maybe<User>>;
    mentions: Array<Maybe<Scalars["String"]["output"]>>;
    nsfw: Scalars["Boolean"]["output"];
    reports: Array<Maybe<Report>>;
    shares: Array<Maybe<User>>;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
    views: Scalars["Int"]["output"];
};

export type PostContent = {
    __typename?: "PostContent";
    audio?: Maybe<Scalars["String"]["output"]>;
    image?: Maybe<Scalars["String"]["output"]>;
    text?: Maybe<Scalars["String"]["output"]>;
    video?: Maybe<Scalars["String"]["output"]>;
};

export type PostContentInput = {
    audio?: InputMaybe<Scalars["Upload"]["input"]>;
    image?: InputMaybe<Scalars["Upload"]["input"]>;
    text?: InputMaybe<Scalars["String"]["input"]>;
    video?: InputMaybe<Scalars["Upload"]["input"]>;
};

export type Query = {
    __typename?: "Query";
    apiStatus?: Maybe<Scalars["Boolean"]["output"]>;
    getActivity: Activity;
    getBlockedUsers: Array<Maybe<User>>;
    getChannel: Channel;
    getChannels: Array<Maybe<Channel>>;
    getComment: Comment;
    getComments: Array<Maybe<Comment>>;
    getFollowers: Array<Maybe<User>>;
    getFollowing: Array<Maybe<User>>;
    getLikeCount: Scalars["Int"]["output"];
    getLikes: Array<Maybe<User>>;
    getMember: Member;
    getMembers: Array<Maybe<Member>>;
    getMessage: Message;
    getMessages: Array<Maybe<Message>>;
    getPost: Post;
    getPosts: Array<Maybe<Post>>;
    getReports: Array<Maybe<Report>>;
    getRole: Role;
    getRoles: Array<Maybe<Role>>;
    getServer: Server;
    getServers: Array<Maybe<Server>>;
    getUser: User;
    getUsers: Array<Maybe<User>>;
    me: User;
};

export type QueryGetActivityArgs = {
    userId: Scalars["String"]["input"];
};

export type QueryGetBlockedUsersArgs = {
    userId: Scalars["String"]["input"];
};

export type QueryGetChannelArgs = {
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type QueryGetChannelsArgs = {
    serverId: Scalars["String"]["input"];
};

export type QueryGetCommentArgs = {
    id: Scalars["String"]["input"];
};

export type QueryGetFollowersArgs = {
    userId: Scalars["String"]["input"];
};

export type QueryGetFollowingArgs = {
    userId: Scalars["String"]["input"];
};

export type QueryGetLikeCountArgs = {
    postId: Scalars["String"]["input"];
};

export type QueryGetLikesArgs = {
    postId: Scalars["String"]["input"];
};

export type QueryGetMemberArgs = {
    serverId: Scalars["String"]["input"];
    userId: Scalars["String"]["input"];
};

export type QueryGetMembersArgs = {
    serverId: Scalars["String"]["input"];
};

export type QueryGetMessageArgs = {
    channelId: Scalars["String"]["input"];
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type QueryGetMessagesArgs = {
    channelId: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type QueryGetPostArgs = {
    id: Scalars["String"]["input"];
};

export type QueryGetRoleArgs = {
    id: Scalars["String"]["input"];
    serverId: Scalars["String"]["input"];
};

export type QueryGetRolesArgs = {
    serverId: Scalars["String"]["input"];
};

export type QueryGetServerArgs = {
    id: Scalars["String"]["input"];
};

export type QueryGetUserArgs = {
    id: Scalars["String"]["input"];
};

export type RegisterInput = {
    confirmPassword: Scalars["String"]["input"];
    displayName?: InputMaybe<Scalars["String"]["input"]>;
    email: Scalars["String"]["input"];
    password: Scalars["String"]["input"];
    username: Scalars["String"]["input"];
};

export type Report = {
    __typename?: "Report";
    comment?: Maybe<Comment>;
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    id: Scalars["String"]["output"];
    post?: Maybe<Post>;
    reason: Scalars["String"]["output"];
    server?: Maybe<Server>;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
    user: User;
};

export type Role = {
    __typename?: "Role";
    color?: Maybe<Scalars["String"]["output"]>;
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    hoisted: Scalars["Boolean"]["output"];
    id: Scalars["String"]["output"];
    mentionable: Scalars["Boolean"]["output"];
    name: Scalars["String"]["output"];
    permissions: Array<Maybe<Scalars["String"]["output"]>>;
    position: Scalars["Int"]["output"];
    server: Server;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
};

export type Server = {
    __typename?: "Server";
    channels: Array<Maybe<Channel>>;
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    description?: Maybe<Scalars["String"]["output"]>;
    icon?: Maybe<Scalars["String"]["output"]>;
    id: Scalars["String"]["output"];
    members: Array<Maybe<Member>>;
    name: Scalars["String"]["output"];
    owner: User;
    roles: Array<Maybe<Role>>;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
};

export type User = {
    __typename?: "User";
    activity?: Maybe<Activity>;
    age: Scalars["Int"]["output"];
    avatar?: Maybe<Scalars["String"]["output"]>;
    banner?: Maybe<Scalars["String"]["output"]>;
    bio?: Maybe<Scalars["String"]["output"]>;
    createdAt: Scalars["DateTime"]["output"];
    createdTimestamp: Scalars["Timestamp"]["output"];
    dateOfBirth: Scalars["Date"]["output"];
    email: Scalars["EmailAddress"]["output"];
    globalName?: Maybe<Scalars["String"]["output"]>;
    id: Scalars["String"]["output"];
    nickname?: Maybe<Scalars["String"]["output"]>;
    servers: Array<Maybe<Server>>;
    updatedAt: Scalars["DateTime"]["output"];
    updatedTimestamp: Scalars["Timestamp"]["output"];
    username: Scalars["String"]["output"];
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
    | ResolverFn<TResult, TParent, TContext, TArgs>
    | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
    TResult,
    TKey extends string,
    TParent,
    TContext,
    TArgs
> {
    subscribe: SubscriptionSubscribeFn<
        { [key in TKey]: TResult },
        TParent,
        TContext,
        TArgs
    >;
    resolve?: SubscriptionResolveFn<
        TResult,
        { [key in TKey]: TResult },
        TContext,
        TArgs
    >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
    TResult,
    TKey extends string,
    TParent,
    TContext,
    TArgs
> =
    | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
    | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
    TResult,
    TKey extends string,
    TParent = {},
    TContext = {},
    TArgs = {}
> =
    | ((
          ...args: any[]
      ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
    | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
    parent: TParent,
    context: TContext,
    info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
    obj: T,
    context: TContext,
    info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
    TResult = {},
    TParent = {},
    TContext = {},
    TArgs = {}
> = (
    next: NextResolverFn<TResult>,
    parent: TParent,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    AccountNumber: ResolverTypeWrapper<Scalars["AccountNumber"]["output"]>;
    Activity: ResolverTypeWrapper<Activity>;
    Any: ResolverTypeWrapper<Scalars["Any"]["output"]>;
    Auth: ResolverTypeWrapper<Auth>;
    BigInt: ResolverTypeWrapper<Scalars["BigInt"]["output"]>;
    Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
    Byte: ResolverTypeWrapper<Scalars["Byte"]["output"]>;
    Channel: ResolverTypeWrapper<Channel>;
    Comment: ResolverTypeWrapper<Comment>;
    CountryCode: ResolverTypeWrapper<Scalars["CountryCode"]["output"]>;
    Cuid: ResolverTypeWrapper<Scalars["Cuid"]["output"]>;
    Currency: ResolverTypeWrapper<Scalars["Currency"]["output"]>;
    DID: ResolverTypeWrapper<Scalars["DID"]["output"]>;
    Date: ResolverTypeWrapper<Scalars["Date"]["output"]>;
    DateTime: ResolverTypeWrapper<Scalars["DateTime"]["output"]>;
    DateTimeISO: ResolverTypeWrapper<Scalars["DateTimeISO"]["output"]>;
    DeweyDecimal: ResolverTypeWrapper<Scalars["DeweyDecimal"]["output"]>;
    Duration: ResolverTypeWrapper<Scalars["Duration"]["output"]>;
    EmailAddress: ResolverTypeWrapper<Scalars["EmailAddress"]["output"]>;
    GUID: ResolverTypeWrapper<Scalars["GUID"]["output"]>;
    HSL: ResolverTypeWrapper<Scalars["HSL"]["output"]>;
    HSLA: ResolverTypeWrapper<Scalars["HSLA"]["output"]>;
    HexColorCode: ResolverTypeWrapper<Scalars["HexColorCode"]["output"]>;
    Hexadecimal: ResolverTypeWrapper<Scalars["Hexadecimal"]["output"]>;
    IBAN: ResolverTypeWrapper<Scalars["IBAN"]["output"]>;
    IP: ResolverTypeWrapper<Scalars["IP"]["output"]>;
    IPCPatent: ResolverTypeWrapper<Scalars["IPCPatent"]["output"]>;
    IPv4: ResolverTypeWrapper<Scalars["IPv4"]["output"]>;
    IPv6: ResolverTypeWrapper<Scalars["IPv6"]["output"]>;
    ISBN: ResolverTypeWrapper<Scalars["ISBN"]["output"]>;
    ISO8601Duration: ResolverTypeWrapper<Scalars["ISO8601Duration"]["output"]>;
    Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
    JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
    JSONObject: ResolverTypeWrapper<Scalars["JSONObject"]["output"]>;
    JWT: ResolverTypeWrapper<Scalars["JWT"]["output"]>;
    LCCSubclass: ResolverTypeWrapper<Scalars["LCCSubclass"]["output"]>;
    Latitude: ResolverTypeWrapper<Scalars["Latitude"]["output"]>;
    LocalDate: ResolverTypeWrapper<Scalars["LocalDate"]["output"]>;
    LocalDateTime: ResolverTypeWrapper<Scalars["LocalDateTime"]["output"]>;
    LocalEndTime: ResolverTypeWrapper<Scalars["LocalEndTime"]["output"]>;
    LocalTime: ResolverTypeWrapper<Scalars["LocalTime"]["output"]>;
    Locale: ResolverTypeWrapper<Scalars["Locale"]["output"]>;
    LoginInput: LoginInput;
    Long: ResolverTypeWrapper<Scalars["Long"]["output"]>;
    Longitude: ResolverTypeWrapper<Scalars["Longitude"]["output"]>;
    MAC: ResolverTypeWrapper<Scalars["MAC"]["output"]>;
    Member: ResolverTypeWrapper<Member>;
    Message: ResolverTypeWrapper<Message>;
    Mutation: ResolverTypeWrapper<{}>;
    NegativeFloat: ResolverTypeWrapper<Scalars["NegativeFloat"]["output"]>;
    NegativeInt: ResolverTypeWrapper<Scalars["NegativeInt"]["output"]>;
    NonEmptyString: ResolverTypeWrapper<Scalars["NonEmptyString"]["output"]>;
    NonNegativeFloat: ResolverTypeWrapper<
        Scalars["NonNegativeFloat"]["output"]
    >;
    NonNegativeInt: ResolverTypeWrapper<Scalars["NonNegativeInt"]["output"]>;
    NonPositiveFloat: ResolverTypeWrapper<
        Scalars["NonPositiveFloat"]["output"]
    >;
    NonPositiveInt: ResolverTypeWrapper<Scalars["NonPositiveInt"]["output"]>;
    ObjectID: ResolverTypeWrapper<Scalars["ObjectID"]["output"]>;
    PhoneNumber: ResolverTypeWrapper<Scalars["PhoneNumber"]["output"]>;
    Port: ResolverTypeWrapper<Scalars["Port"]["output"]>;
    PositiveFloat: ResolverTypeWrapper<Scalars["PositiveFloat"]["output"]>;
    PositiveInt: ResolverTypeWrapper<Scalars["PositiveInt"]["output"]>;
    Post: ResolverTypeWrapper<Post>;
    PostContent: ResolverTypeWrapper<PostContent>;
    PostContentInput: PostContentInput;
    PostalCode: ResolverTypeWrapper<Scalars["PostalCode"]["output"]>;
    Query: ResolverTypeWrapper<{}>;
    RGB: ResolverTypeWrapper<Scalars["RGB"]["output"]>;
    RGBA: ResolverTypeWrapper<Scalars["RGBA"]["output"]>;
    RegisterInput: RegisterInput;
    Report: ResolverTypeWrapper<Report>;
    Role: ResolverTypeWrapper<Role>;
    RoutingNumber: ResolverTypeWrapper<Scalars["RoutingNumber"]["output"]>;
    SESSN: ResolverTypeWrapper<Scalars["SESSN"]["output"]>;
    SafeInt: ResolverTypeWrapper<Scalars["SafeInt"]["output"]>;
    SemVer: ResolverTypeWrapper<Scalars["SemVer"]["output"]>;
    Server: ResolverTypeWrapper<Server>;
    String: ResolverTypeWrapper<Scalars["String"]["output"]>;
    Time: ResolverTypeWrapper<Scalars["Time"]["output"]>;
    TimeZone: ResolverTypeWrapper<Scalars["TimeZone"]["output"]>;
    Timestamp: ResolverTypeWrapper<Scalars["Timestamp"]["output"]>;
    URL: ResolverTypeWrapper<Scalars["URL"]["output"]>;
    USCurrency: ResolverTypeWrapper<Scalars["USCurrency"]["output"]>;
    UUID: ResolverTypeWrapper<Scalars["UUID"]["output"]>;
    UnsignedFloat: ResolverTypeWrapper<Scalars["UnsignedFloat"]["output"]>;
    UnsignedInt: ResolverTypeWrapper<Scalars["UnsignedInt"]["output"]>;
    Upload: ResolverTypeWrapper<Scalars["Upload"]["output"]>;
    User: ResolverTypeWrapper<User>;
    UtcOffset: ResolverTypeWrapper<Scalars["UtcOffset"]["output"]>;
    Void: ResolverTypeWrapper<Scalars["Void"]["output"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    AccountNumber: Scalars["AccountNumber"]["output"];
    Activity: Activity;
    Any: Scalars["Any"]["output"];
    Auth: Auth;
    BigInt: Scalars["BigInt"]["output"];
    Boolean: Scalars["Boolean"]["output"];
    Byte: Scalars["Byte"]["output"];
    Channel: Channel;
    Comment: Comment;
    CountryCode: Scalars["CountryCode"]["output"];
    Cuid: Scalars["Cuid"]["output"];
    Currency: Scalars["Currency"]["output"];
    DID: Scalars["DID"]["output"];
    Date: Scalars["Date"]["output"];
    DateTime: Scalars["DateTime"]["output"];
    DateTimeISO: Scalars["DateTimeISO"]["output"];
    DeweyDecimal: Scalars["DeweyDecimal"]["output"];
    Duration: Scalars["Duration"]["output"];
    EmailAddress: Scalars["EmailAddress"]["output"];
    GUID: Scalars["GUID"]["output"];
    HSL: Scalars["HSL"]["output"];
    HSLA: Scalars["HSLA"]["output"];
    HexColorCode: Scalars["HexColorCode"]["output"];
    Hexadecimal: Scalars["Hexadecimal"]["output"];
    IBAN: Scalars["IBAN"]["output"];
    IP: Scalars["IP"]["output"];
    IPCPatent: Scalars["IPCPatent"]["output"];
    IPv4: Scalars["IPv4"]["output"];
    IPv6: Scalars["IPv6"]["output"];
    ISBN: Scalars["ISBN"]["output"];
    ISO8601Duration: Scalars["ISO8601Duration"]["output"];
    Int: Scalars["Int"]["output"];
    JSON: Scalars["JSON"]["output"];
    JSONObject: Scalars["JSONObject"]["output"];
    JWT: Scalars["JWT"]["output"];
    LCCSubclass: Scalars["LCCSubclass"]["output"];
    Latitude: Scalars["Latitude"]["output"];
    LocalDate: Scalars["LocalDate"]["output"];
    LocalDateTime: Scalars["LocalDateTime"]["output"];
    LocalEndTime: Scalars["LocalEndTime"]["output"];
    LocalTime: Scalars["LocalTime"]["output"];
    Locale: Scalars["Locale"]["output"];
    LoginInput: LoginInput;
    Long: Scalars["Long"]["output"];
    Longitude: Scalars["Longitude"]["output"];
    MAC: Scalars["MAC"]["output"];
    Member: Member;
    Message: Message;
    Mutation: {};
    NegativeFloat: Scalars["NegativeFloat"]["output"];
    NegativeInt: Scalars["NegativeInt"]["output"];
    NonEmptyString: Scalars["NonEmptyString"]["output"];
    NonNegativeFloat: Scalars["NonNegativeFloat"]["output"];
    NonNegativeInt: Scalars["NonNegativeInt"]["output"];
    NonPositiveFloat: Scalars["NonPositiveFloat"]["output"];
    NonPositiveInt: Scalars["NonPositiveInt"]["output"];
    ObjectID: Scalars["ObjectID"]["output"];
    PhoneNumber: Scalars["PhoneNumber"]["output"];
    Port: Scalars["Port"]["output"];
    PositiveFloat: Scalars["PositiveFloat"]["output"];
    PositiveInt: Scalars["PositiveInt"]["output"];
    Post: Post;
    PostContent: PostContent;
    PostContentInput: PostContentInput;
    PostalCode: Scalars["PostalCode"]["output"];
    Query: {};
    RGB: Scalars["RGB"]["output"];
    RGBA: Scalars["RGBA"]["output"];
    RegisterInput: RegisterInput;
    Report: Report;
    Role: Role;
    RoutingNumber: Scalars["RoutingNumber"]["output"];
    SESSN: Scalars["SESSN"]["output"];
    SafeInt: Scalars["SafeInt"]["output"];
    SemVer: Scalars["SemVer"]["output"];
    Server: Server;
    String: Scalars["String"]["output"];
    Time: Scalars["Time"]["output"];
    TimeZone: Scalars["TimeZone"]["output"];
    Timestamp: Scalars["Timestamp"]["output"];
    URL: Scalars["URL"]["output"];
    USCurrency: Scalars["USCurrency"]["output"];
    UUID: Scalars["UUID"]["output"];
    UnsignedFloat: Scalars["UnsignedFloat"]["output"];
    UnsignedInt: Scalars["UnsignedInt"]["output"];
    Upload: Scalars["Upload"]["output"];
    User: User;
    UtcOffset: Scalars["UtcOffset"]["output"];
    Void: Scalars["Void"]["output"];
};

export type InheritsDirectiveArgs = {
    type: Scalars["String"]["input"];
};

export type InheritsDirectiveResolver<
    Result,
    Parent,
    ContextType = any,
    Args = InheritsDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface AccountNumberScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["AccountNumber"], any> {
    name: "AccountNumber";
}

export type ActivityResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Activity"] = ResolversParentTypes["Activity"]
> = {
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    lastActive?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    lastActiveTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    text?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface AnyScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Any"], any> {
    name: "Any";
}

export type AuthResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Auth"] = ResolversParentTypes["Auth"]
> = {
    token?: Resolver<ResolversTypes["JWT"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface BigIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["BigInt"], any> {
    name: "BigInt";
}

export interface ByteScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Byte"], any> {
    name: "Byte";
}

export type ChannelResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Channel"] = ResolversParentTypes["Channel"]
> = {
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    messages?: Resolver<
        Array<Maybe<ResolversTypes["Message"]>>,
        ParentType,
        ContextType
    >;
    name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    nsfw?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
    position?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
    server?: Resolver<ResolversTypes["Server"], ParentType, ContextType>;
    topic?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    type?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CommentResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Comment"] = ResolversParentTypes["Comment"]
> = {
    content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    likes?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType
    >;
    post?: Resolver<ResolversTypes["Post"], ParentType, ContextType>;
    reports?: Resolver<
        Array<Maybe<ResolversTypes["Report"]>>,
        ParentType,
        ContextType
    >;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CountryCodeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["CountryCode"], any> {
    name: "CountryCode";
}

export interface CuidScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Cuid"], any> {
    name: "Cuid";
}

export interface CurrencyScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Currency"], any> {
    name: "Currency";
}

export interface DidScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["DID"], any> {
    name: "DID";
}

export interface DateScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Date"], any> {
    name: "Date";
}

export interface DateTimeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["DateTime"], any> {
    name: "DateTime";
}

export interface DateTimeIsoScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["DateTimeISO"], any> {
    name: "DateTimeISO";
}

export interface DeweyDecimalScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["DeweyDecimal"], any> {
    name: "DeweyDecimal";
}

export interface DurationScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Duration"], any> {
    name: "Duration";
}

export interface EmailAddressScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["EmailAddress"], any> {
    name: "EmailAddress";
}

export interface GuidScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["GUID"], any> {
    name: "GUID";
}

export interface HslScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["HSL"], any> {
    name: "HSL";
}

export interface HslaScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["HSLA"], any> {
    name: "HSLA";
}

export interface HexColorCodeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["HexColorCode"], any> {
    name: "HexColorCode";
}

export interface HexadecimalScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Hexadecimal"], any> {
    name: "Hexadecimal";
}

export interface IbanScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["IBAN"], any> {
    name: "IBAN";
}

export interface IpScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["IP"], any> {
    name: "IP";
}

export interface IpcPatentScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["IPCPatent"], any> {
    name: "IPCPatent";
}

export interface IPv4ScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["IPv4"], any> {
    name: "IPv4";
}

export interface IPv6ScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["IPv6"], any> {
    name: "IPv6";
}

export interface IsbnScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["ISBN"], any> {
    name: "ISBN";
}

export interface Iso8601DurationScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["ISO8601Duration"], any> {
    name: "ISO8601Duration";
}

export interface JsonScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
    name: "JSON";
}

export interface JsonObjectScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["JSONObject"], any> {
    name: "JSONObject";
}

export interface JwtScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["JWT"], any> {
    name: "JWT";
}

export interface LccSubclassScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["LCCSubclass"], any> {
    name: "LCCSubclass";
}

export interface LatitudeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Latitude"], any> {
    name: "Latitude";
}

export interface LocalDateScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["LocalDate"], any> {
    name: "LocalDate";
}

export interface LocalDateTimeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["LocalDateTime"], any> {
    name: "LocalDateTime";
}

export interface LocalEndTimeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["LocalEndTime"], any> {
    name: "LocalEndTime";
}

export interface LocalTimeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["LocalTime"], any> {
    name: "LocalTime";
}

export interface LocaleScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Locale"], any> {
    name: "Locale";
}

export interface LongScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Long"], any> {
    name: "Long";
}

export interface LongitudeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Longitude"], any> {
    name: "Longitude";
}

export interface MacScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["MAC"], any> {
    name: "MAC";
}

export type MemberResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Member"] = ResolversParentTypes["Member"]
> = {
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    joinedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    joinedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    permissions?: Resolver<
        Array<Maybe<ResolversTypes["String"]>>,
        ParentType,
        ContextType
    >;
    roles?: Resolver<
        Array<Maybe<ResolversTypes["Role"]>>,
        ParentType,
        ContextType
    >;
    server?: Resolver<ResolversTypes["Server"], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    user?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Message"] = ResolversParentTypes["Message"]
> = {
    channel?: Resolver<ResolversTypes["Channel"], ParentType, ContextType>;
    content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    member?: Resolver<ResolversTypes["Member"], ParentType, ContextType>;
    server?: Resolver<ResolversTypes["Server"], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = {
    addMember?: Resolver<
        ResolversTypes["Member"],
        ParentType,
        ContextType,
        RequireFields<MutationAddMemberArgs, "serverId" | "userId">
    >;
    blockUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationBlockUserArgs, "userId">
    >;
    createChannel?: Resolver<
        ResolversTypes["Channel"],
        ParentType,
        ContextType,
        RequireFields<MutationCreateChannelArgs, "name" | "serverId">
    >;
    createComment?: Resolver<
        ResolversTypes["Comment"],
        ParentType,
        ContextType,
        RequireFields<
            MutationCreateCommentArgs,
            "content" | "mentions" | "postId"
        >
    >;
    createMessage?: Resolver<
        ResolversTypes["Message"],
        ParentType,
        ContextType,
        RequireFields<
            MutationCreateMessageArgs,
            "channelId" | "content" | "serverId"
        >
    >;
    createPost?: Resolver<
        ResolversTypes["Post"],
        ParentType,
        ContextType,
        RequireFields<
            MutationCreatePostArgs,
            "content" | "hashtags" | "mentions"
        >
    >;
    createRole?: Resolver<
        ResolversTypes["Role"],
        ParentType,
        ContextType,
        RequireFields<MutationCreateRoleArgs, "name" | "serverId">
    >;
    createServer?: Resolver<
        ResolversTypes["Server"],
        ParentType,
        ContextType,
        RequireFields<MutationCreateServerArgs, "name">
    >;
    deleteChannel?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteChannelArgs, "id" | "serverId">
    >;
    deleteComment?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteCommentArgs, "id">
    >;
    deleteMessage?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<
            MutationDeleteMessageArgs,
            "channelId" | "id" | "serverId"
        >
    >;
    deletePost?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationDeletePostArgs, "id">
    >;
    deleteRole?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteRoleArgs, "id" | "serverId">
    >;
    deleteServer?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationDeleteServerArgs, "id">
    >;
    followUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationFollowUserArgs, "userId">
    >;
    likeComment?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationLikeCommentArgs, "commentId">
    >;
    likePost?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationLikePostArgs, "postId">
    >;
    loginUser?: Resolver<
        ResolversTypes["Auth"],
        ParentType,
        ContextType,
        RequireFields<MutationLoginUserArgs, "input">
    >;
    registerUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationRegisterUserArgs, "input">
    >;
    removeMember?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationRemoveMemberArgs, "serverId" | "userId">
    >;
    reportComment?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationReportCommentArgs, "commentId">
    >;
    reportPost?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationReportPostArgs, "postId">
    >;
    reportUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationReportUserArgs, "userId">
    >;
    unblockUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationUnblockUserArgs, "userId">
    >;
    unfollowUser?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationUnfollowUserArgs, "userId">
    >;
    unlikeComment?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationUnlikeCommentArgs, "commentId">
    >;
    unlikePost?: Resolver<
        ResolversTypes["Boolean"],
        ParentType,
        ContextType,
        RequireFields<MutationUnlikePostArgs, "postId">
    >;
    updateActivity?: Resolver<
        ResolversTypes["Activity"],
        ParentType,
        ContextType,
        RequireFields<MutationUpdateActivityArgs, "userId">
    >;
    updateChannel?: Resolver<
        ResolversTypes["Channel"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateChannelArgs,
            "id" | "propertyNames" | "propertyValues" | "serverId"
        >
    >;
    updateComment?: Resolver<
        ResolversTypes["Comment"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateCommentArgs,
            "id" | "propertyNames" | "propertyValues"
        >
    >;
    updateMember?: Resolver<
        ResolversTypes["Member"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateMemberArgs,
            "propertyNames" | "propertyValues" | "serverId" | "userId"
        >
    >;
    updateMessage?: Resolver<
        ResolversTypes["Message"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateMessageArgs,
            "channelId" | "content" | "id" | "serverId"
        >
    >;
    updatePost?: Resolver<
        ResolversTypes["Post"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdatePostArgs,
            "id" | "propertyNames" | "propertyValues"
        >
    >;
    updateRole?: Resolver<
        ResolversTypes["Role"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateRoleArgs,
            "id" | "propertyNames" | "propertyValues" | "serverId"
        >
    >;
    updateServer?: Resolver<
        ResolversTypes["Server"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateServerArgs,
            "id" | "propertyNames" | "propertyValues"
        >
    >;
    updateUser?: Resolver<
        ResolversTypes["User"],
        ParentType,
        ContextType,
        RequireFields<
            MutationUpdateUserArgs,
            "id" | "propertyNames" | "propertyValues"
        >
    >;
};

export interface NegativeFloatScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NegativeFloat"], any> {
    name: "NegativeFloat";
}

export interface NegativeIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NegativeInt"], any> {
    name: "NegativeInt";
}

export interface NonEmptyStringScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NonEmptyString"], any> {
    name: "NonEmptyString";
}

export interface NonNegativeFloatScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NonNegativeFloat"], any> {
    name: "NonNegativeFloat";
}

export interface NonNegativeIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NonNegativeInt"], any> {
    name: "NonNegativeInt";
}

export interface NonPositiveFloatScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NonPositiveFloat"], any> {
    name: "NonPositiveFloat";
}

export interface NonPositiveIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["NonPositiveInt"], any> {
    name: "NonPositiveInt";
}

export interface ObjectIdScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["ObjectID"], any> {
    name: "ObjectID";
}

export interface PhoneNumberScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["PhoneNumber"], any> {
    name: "PhoneNumber";
}

export interface PortScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Port"], any> {
    name: "Port";
}

export interface PositiveFloatScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["PositiveFloat"], any> {
    name: "PositiveFloat";
}

export interface PositiveIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["PositiveInt"], any> {
    name: "PositiveInt";
}

export type PostResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Post"] = ResolversParentTypes["Post"]
> = {
    comments?: Resolver<
        Array<Maybe<ResolversTypes["Comment"]>>,
        ParentType,
        ContextType
    >;
    content?: Resolver<ResolversTypes["PostContent"], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    favorites?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType
    >;
    hashtags?: Resolver<
        Array<Maybe<ResolversTypes["String"]>>,
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    isPinned?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
    likes?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType
    >;
    mentions?: Resolver<
        Array<Maybe<ResolversTypes["String"]>>,
        ParentType,
        ContextType
    >;
    nsfw?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
    reports?: Resolver<
        Array<Maybe<ResolversTypes["Report"]>>,
        ParentType,
        ContextType
    >;
    shares?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType
    >;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    views?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostContentResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["PostContent"] = ResolversParentTypes["PostContent"]
> = {
    audio?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    image?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    text?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    video?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface PostalCodeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["PostalCode"], any> {
    name: "PostalCode";
}

export type QueryResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
    apiStatus?: Resolver<
        Maybe<ResolversTypes["Boolean"]>,
        ParentType,
        ContextType
    >;
    getActivity?: Resolver<
        ResolversTypes["Activity"],
        ParentType,
        ContextType,
        RequireFields<QueryGetActivityArgs, "userId">
    >;
    getBlockedUsers?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetBlockedUsersArgs, "userId">
    >;
    getChannel?: Resolver<
        ResolversTypes["Channel"],
        ParentType,
        ContextType,
        RequireFields<QueryGetChannelArgs, "id" | "serverId">
    >;
    getChannels?: Resolver<
        Array<Maybe<ResolversTypes["Channel"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetChannelsArgs, "serverId">
    >;
    getComment?: Resolver<
        ResolversTypes["Comment"],
        ParentType,
        ContextType,
        RequireFields<QueryGetCommentArgs, "id">
    >;
    getComments?: Resolver<
        Array<Maybe<ResolversTypes["Comment"]>>,
        ParentType,
        ContextType
    >;
    getFollowers?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetFollowersArgs, "userId">
    >;
    getFollowing?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetFollowingArgs, "userId">
    >;
    getLikeCount?: Resolver<
        ResolversTypes["Int"],
        ParentType,
        ContextType,
        RequireFields<QueryGetLikeCountArgs, "postId">
    >;
    getLikes?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetLikesArgs, "postId">
    >;
    getMember?: Resolver<
        ResolversTypes["Member"],
        ParentType,
        ContextType,
        RequireFields<QueryGetMemberArgs, "serverId" | "userId">
    >;
    getMembers?: Resolver<
        Array<Maybe<ResolversTypes["Member"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetMembersArgs, "serverId">
    >;
    getMessage?: Resolver<
        ResolversTypes["Message"],
        ParentType,
        ContextType,
        RequireFields<QueryGetMessageArgs, "channelId" | "id" | "serverId">
    >;
    getMessages?: Resolver<
        Array<Maybe<ResolversTypes["Message"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetMessagesArgs, "channelId" | "serverId">
    >;
    getPost?: Resolver<
        ResolversTypes["Post"],
        ParentType,
        ContextType,
        RequireFields<QueryGetPostArgs, "id">
    >;
    getPosts?: Resolver<
        Array<Maybe<ResolversTypes["Post"]>>,
        ParentType,
        ContextType
    >;
    getReports?: Resolver<
        Array<Maybe<ResolversTypes["Report"]>>,
        ParentType,
        ContextType
    >;
    getRole?: Resolver<
        ResolversTypes["Role"],
        ParentType,
        ContextType,
        RequireFields<QueryGetRoleArgs, "id" | "serverId">
    >;
    getRoles?: Resolver<
        Array<Maybe<ResolversTypes["Role"]>>,
        ParentType,
        ContextType,
        RequireFields<QueryGetRolesArgs, "serverId">
    >;
    getServer?: Resolver<
        ResolversTypes["Server"],
        ParentType,
        ContextType,
        RequireFields<QueryGetServerArgs, "id">
    >;
    getServers?: Resolver<
        Array<Maybe<ResolversTypes["Server"]>>,
        ParentType,
        ContextType
    >;
    getUser?: Resolver<
        ResolversTypes["User"],
        ParentType,
        ContextType,
        RequireFields<QueryGetUserArgs, "id">
    >;
    getUsers?: Resolver<
        Array<Maybe<ResolversTypes["User"]>>,
        ParentType,
        ContextType
    >;
    me?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
};

export interface RgbScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["RGB"], any> {
    name: "RGB";
}

export interface RgbaScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["RGBA"], any> {
    name: "RGBA";
}

export type ReportResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Report"] = ResolversParentTypes["Report"]
> = {
    comment?: Resolver<
        Maybe<ResolversTypes["Comment"]>,
        ParentType,
        ContextType
    >;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    post?: Resolver<Maybe<ResolversTypes["Post"]>, ParentType, ContextType>;
    reason?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    server?: Resolver<Maybe<ResolversTypes["Server"]>, ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    user?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RoleResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Role"] = ResolversParentTypes["Role"]
> = {
    color?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    hoisted?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    mentionable?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
    name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    permissions?: Resolver<
        Array<Maybe<ResolversTypes["String"]>>,
        ParentType,
        ContextType
    >;
    position?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
    server?: Resolver<ResolversTypes["Server"], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface RoutingNumberScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["RoutingNumber"], any> {
    name: "RoutingNumber";
}

export interface SessnScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["SESSN"], any> {
    name: "SESSN";
}

export interface SafeIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["SafeInt"], any> {
    name: "SafeInt";
}

export interface SemVerScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["SemVer"], any> {
    name: "SemVer";
}

export type ServerResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["Server"] = ResolversParentTypes["Server"]
> = {
    channels?: Resolver<
        Array<Maybe<ResolversTypes["Channel"]>>,
        ParentType,
        ContextType
    >;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    description?: Resolver<
        Maybe<ResolversTypes["String"]>,
        ParentType,
        ContextType
    >;
    icon?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    members?: Resolver<
        Array<Maybe<ResolversTypes["Member"]>>,
        ParentType,
        ContextType
    >;
    name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    owner?: Resolver<ResolversTypes["User"], ParentType, ContextType>;
    roles?: Resolver<
        Array<Maybe<ResolversTypes["Role"]>>,
        ParentType,
        ContextType
    >;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface TimeScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Time"], any> {
    name: "Time";
}

export interface TimeZoneScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["TimeZone"], any> {
    name: "TimeZone";
}

export interface TimestampScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Timestamp"], any> {
    name: "Timestamp";
}

export interface UrlScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["URL"], any> {
    name: "URL";
}

export interface UsCurrencyScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["USCurrency"], any> {
    name: "USCurrency";
}

export interface UuidScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["UUID"], any> {
    name: "UUID";
}

export interface UnsignedFloatScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["UnsignedFloat"], any> {
    name: "UnsignedFloat";
}

export interface UnsignedIntScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["UnsignedInt"], any> {
    name: "UnsignedInt";
}

export interface UploadScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Upload"], any> {
    name: "Upload";
}

export type UserResolvers<
    ContextType = any,
    ParentType extends
        ResolversParentTypes["User"] = ResolversParentTypes["User"]
> = {
    activity?: Resolver<
        Maybe<ResolversTypes["Activity"]>,
        ParentType,
        ContextType
    >;
    age?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
    avatar?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    banner?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    bio?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    createdTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    dateOfBirth?: Resolver<ResolversTypes["Date"], ParentType, ContextType>;
    email?: Resolver<ResolversTypes["EmailAddress"], ParentType, ContextType>;
    globalName?: Resolver<
        Maybe<ResolversTypes["String"]>,
        ParentType,
        ContextType
    >;
    id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    nickname?: Resolver<
        Maybe<ResolversTypes["String"]>,
        ParentType,
        ContextType
    >;
    servers?: Resolver<
        Array<Maybe<ResolversTypes["Server"]>>,
        ParentType,
        ContextType
    >;
    updatedAt?: Resolver<ResolversTypes["DateTime"], ParentType, ContextType>;
    updatedTimestamp?: Resolver<
        ResolversTypes["Timestamp"],
        ParentType,
        ContextType
    >;
    username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UtcOffsetScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["UtcOffset"], any> {
    name: "UtcOffset";
}

export interface VoidScalarConfig
    extends GraphQLScalarTypeConfig<ResolversTypes["Void"], any> {
    name: "Void";
}

export type Resolvers<ContextType = any> = {
    AccountNumber?: GraphQLScalarType;
    Activity?: ActivityResolvers<ContextType>;
    Any?: GraphQLScalarType;
    Auth?: AuthResolvers<ContextType>;
    BigInt?: GraphQLScalarType;
    Byte?: GraphQLScalarType;
    Channel?: ChannelResolvers<ContextType>;
    Comment?: CommentResolvers<ContextType>;
    CountryCode?: GraphQLScalarType;
    Cuid?: GraphQLScalarType;
    Currency?: GraphQLScalarType;
    DID?: GraphQLScalarType;
    Date?: GraphQLScalarType;
    DateTime?: GraphQLScalarType;
    DateTimeISO?: GraphQLScalarType;
    DeweyDecimal?: GraphQLScalarType;
    Duration?: GraphQLScalarType;
    EmailAddress?: GraphQLScalarType;
    GUID?: GraphQLScalarType;
    HSL?: GraphQLScalarType;
    HSLA?: GraphQLScalarType;
    HexColorCode?: GraphQLScalarType;
    Hexadecimal?: GraphQLScalarType;
    IBAN?: GraphQLScalarType;
    IP?: GraphQLScalarType;
    IPCPatent?: GraphQLScalarType;
    IPv4?: GraphQLScalarType;
    IPv6?: GraphQLScalarType;
    ISBN?: GraphQLScalarType;
    ISO8601Duration?: GraphQLScalarType;
    JSON?: GraphQLScalarType;
    JSONObject?: GraphQLScalarType;
    JWT?: GraphQLScalarType;
    LCCSubclass?: GraphQLScalarType;
    Latitude?: GraphQLScalarType;
    LocalDate?: GraphQLScalarType;
    LocalDateTime?: GraphQLScalarType;
    LocalEndTime?: GraphQLScalarType;
    LocalTime?: GraphQLScalarType;
    Locale?: GraphQLScalarType;
    Long?: GraphQLScalarType;
    Longitude?: GraphQLScalarType;
    MAC?: GraphQLScalarType;
    Member?: MemberResolvers<ContextType>;
    Message?: MessageResolvers<ContextType>;
    Mutation?: MutationResolvers<ContextType>;
    NegativeFloat?: GraphQLScalarType;
    NegativeInt?: GraphQLScalarType;
    NonEmptyString?: GraphQLScalarType;
    NonNegativeFloat?: GraphQLScalarType;
    NonNegativeInt?: GraphQLScalarType;
    NonPositiveFloat?: GraphQLScalarType;
    NonPositiveInt?: GraphQLScalarType;
    ObjectID?: GraphQLScalarType;
    PhoneNumber?: GraphQLScalarType;
    Port?: GraphQLScalarType;
    PositiveFloat?: GraphQLScalarType;
    PositiveInt?: GraphQLScalarType;
    Post?: PostResolvers<ContextType>;
    PostContent?: PostContentResolvers<ContextType>;
    PostalCode?: GraphQLScalarType;
    Query?: QueryResolvers<ContextType>;
    RGB?: GraphQLScalarType;
    RGBA?: GraphQLScalarType;
    Report?: ReportResolvers<ContextType>;
    Role?: RoleResolvers<ContextType>;
    RoutingNumber?: GraphQLScalarType;
    SESSN?: GraphQLScalarType;
    SafeInt?: GraphQLScalarType;
    SemVer?: GraphQLScalarType;
    Server?: ServerResolvers<ContextType>;
    Time?: GraphQLScalarType;
    TimeZone?: GraphQLScalarType;
    Timestamp?: GraphQLScalarType;
    URL?: GraphQLScalarType;
    USCurrency?: GraphQLScalarType;
    UUID?: GraphQLScalarType;
    UnsignedFloat?: GraphQLScalarType;
    UnsignedInt?: GraphQLScalarType;
    Upload?: GraphQLScalarType;
    User?: UserResolvers<ContextType>;
    UtcOffset?: GraphQLScalarType;
    Void?: GraphQLScalarType;
};

export type DirectiveResolvers<ContextType = any> = {
    inherits?: InheritsDirectiveResolver<any, any, ContextType>;
};

export type AccountNumber = Scalars["AccountNumber"];
export type Any = Scalars["Any"];
export type BigInt = Scalars["BigInt"];
export type Byte = Scalars["Byte"];
export type CountryCode = Scalars["CountryCode"];
export type Cuid = Scalars["Cuid"];
export type Currency = Scalars["Currency"];
export type Did = Scalars["DID"];
export type Date = Scalars["Date"];
export type DateTime = Scalars["DateTime"];
export type DateTimeIso = Scalars["DateTimeISO"];
export type DeweyDecimal = Scalars["DeweyDecimal"];
export type Duration = Scalars["Duration"];
export type EmailAddress = Scalars["EmailAddress"];
export type Guid = Scalars["GUID"];
export type Hsl = Scalars["HSL"];
export type Hsla = Scalars["HSLA"];
export type HexColorCode = Scalars["HexColorCode"];
export type Hexadecimal = Scalars["Hexadecimal"];
export type Iban = Scalars["IBAN"];
export type Ip = Scalars["IP"];
export type IpcPatent = Scalars["IPCPatent"];
export type IPv4 = Scalars["IPv4"];
export type IPv6 = Scalars["IPv6"];
export type Isbn = Scalars["ISBN"];
export type Iso8601Duration = Scalars["ISO8601Duration"];
export type Json = Scalars["JSON"];
export type JsonObject = Scalars["JSONObject"];
export type Jwt = Scalars["JWT"];
export type LccSubclass = Scalars["LCCSubclass"];
export type Latitude = Scalars["Latitude"];
export type LocalDate = Scalars["LocalDate"];
export type LocalDateTime = Scalars["LocalDateTime"];
export type LocalEndTime = Scalars["LocalEndTime"];
export type LocalTime = Scalars["LocalTime"];
export type Locale = Scalars["Locale"];
export type Long = Scalars["Long"];
export type Longitude = Scalars["Longitude"];
export type Mac = Scalars["MAC"];
export type NegativeFloat = Scalars["NegativeFloat"];
export type NegativeInt = Scalars["NegativeInt"];
export type NonEmptyString = Scalars["NonEmptyString"];
export type NonNegativeFloat = Scalars["NonNegativeFloat"];
export type NonNegativeInt = Scalars["NonNegativeInt"];
export type NonPositiveFloat = Scalars["NonPositiveFloat"];
export type NonPositiveInt = Scalars["NonPositiveInt"];
export type ObjectId = Scalars["ObjectID"];
export type PhoneNumber = Scalars["PhoneNumber"];
export type Port = Scalars["Port"];
export type PositiveFloat = Scalars["PositiveFloat"];
export type PositiveInt = Scalars["PositiveInt"];
export type PostalCode = Scalars["PostalCode"];
export type Rgb = Scalars["RGB"];
export type Rgba = Scalars["RGBA"];
export type RoutingNumber = Scalars["RoutingNumber"];
export type Sessn = Scalars["SESSN"];
export type SafeInt = Scalars["SafeInt"];
export type SemVer = Scalars["SemVer"];
export type Time = Scalars["Time"];
export type TimeZone = Scalars["TimeZone"];
export type Timestamp = Scalars["Timestamp"];
export type Url = Scalars["URL"];
export type UsCurrency = Scalars["USCurrency"];
export type Uuid = Scalars["UUID"];
export type UnsignedFloat = Scalars["UnsignedFloat"];
export type UnsignedInt = Scalars["UnsignedInt"];
export type Upload = Scalars["Upload"];
export type UtcOffset = Scalars["UtcOffset"];
export type Void = Scalars["Void"];
