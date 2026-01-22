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

export const followUser = async (userId) => {
    try {
        const response = await mainApi.post(`/api/user/follow/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error following user:", error);
        throw error;
    }
};

export const unfollowUser = async (userId) => {
    try {
        const response = await mainApi.post(`/api/user/unfollow/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
};
