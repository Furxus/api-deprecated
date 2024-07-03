declare type RegisterInput = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: Date;
};

declare type LoginInput = {
    usernameOrEmail: string;
    password: string;
};
