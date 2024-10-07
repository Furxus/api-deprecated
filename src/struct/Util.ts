import axios from "axios";

export const extractUrls = (content: string) => {
    const regex = /((https?):\/\/[^\s/$.?#].[^\s]*)/gi;
    return content.match(regex) ?? [];
};

export const genRandColor = () =>
    [...Array(6)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("");

export const imageToBuffer = async (url: string) =>
    (
        await axios.get(url, {
            responseType: "arraybuffer"
        })
    ).data;
