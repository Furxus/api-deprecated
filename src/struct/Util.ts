export const genVerificationUrl = (code: string) => {
    if (process.env.NODE_ENV === "development") {
        return `http://localhost:1420/verify/${code}`;
    }

    return `https://furxus.com/verify/${code}`;
};

export const genVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8);
};
