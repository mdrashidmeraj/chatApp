export const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

export const locationGenerateMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}