export const extractUrls = (text: string): string[] => {
    const urlRegex =
        /(https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\\/~+#-]*[\w@?^=%&\\/~+#-])/g;
    return text.match(urlRegex) || [];
};
