declare type RegisterInput = {
    username: string;
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
};

declare type LoginInput = {
    usernameOrEmail: string;
    password: string;
};

declare type CreateServerInput = {
    name: string;
    icon: any;
};

declare type ServerSettings = {
    roles: string[] | null;
    channels: string[] | null;
    invites:
        | {
              code: string;
              uses: number;
              maxUses: number;
              expiresAt: Date | null;
              expiresTimestamp: number | null;
              createdAt: Date;
              createdTimestamp: number;
          }[]
        | null;
};

declare enum ServerEvents {
    ServerCreated = "SERVER_CREATED",
    ServerJoined = "SERVER_JOINED",
    ServerLeft = "SERVER_LEFT"
}

declare enum ChannelEvents {
    ChannelCreated = "CHANNEL_CREATED",
    MessageCreated = "MESSAGE_CREATED"
}
