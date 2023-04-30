export const generateMessage = (text, userName) => {
    return {
        text,
        createdAt: new Date().getTime(),
        userName
    }
}

export const locationGenerateMessage = (url, username) => {
    return {
        url,
        createdAt: new Date().getTime(),
        username
    }
}