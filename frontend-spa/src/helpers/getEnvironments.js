export const getEnvironments = () => {
    return {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_MODE: import.meta.env.VITE_MODE
    }
};
