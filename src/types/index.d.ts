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
