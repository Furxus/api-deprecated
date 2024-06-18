declare type SignupInput = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
};

declare type LoginInput = {
    usernameOrEmail: string;
    password: string;
};
