import mainApi from "./axios.js";

export const getUniversalFeed = async (page = 1, limit = 20) => {
  try {
    const response = await mainApi.get("/api/user/feed", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching universal feed:", error);
    throw error;
  }
};
