export const extractUrls = (content: string) => {
    const regex = /((https?):\/\/[^\s/$.?#].[^\s]*)/gi;
    return content.match(regex) ?? [];
};
