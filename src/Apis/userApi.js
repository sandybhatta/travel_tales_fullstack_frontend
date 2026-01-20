import mainApi from "./axios.js";

export const searchMentionableUsers = async (query) => {
    try {
        const response = await mainApi.get(`/api/user/search-mentions?q=${query}`);
        return response.data;
    } catch (error) {
        console.error("Error searching users for mentions:", error);
        throw error;
    }
};
