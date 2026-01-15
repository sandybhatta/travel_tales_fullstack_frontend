import mainApi from "./axios.js";

// Posts Feed APIs
export const getFollowingPosts = async () => {
  try {
    const response = await mainApi.get("/api/posts/feed/following");
    return response.data;
  } catch (error) {
    console.error("Error fetching following posts:", error);
    throw error;
  }
};

export const getExplorePosts = async () => {
  try {
    const response = await mainApi.get("/api/posts/feed/explore");
    return response.data;
  } catch (error) {
    console.error("Error fetching explore posts:", error);
    throw error;
  }
};

// Trips Feed APIs
export const getVisibleTrips = async (page = 1, limit = 20) => {
  try {
    const response = await mainApi.get("/api/trips/visible", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching visible trips:", error);
    throw error;
  }
};

export const getPublicTrips = async (page = 1, limit = 20) => {
  try {
    const response = await mainApi.get("/api/trips/public", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching public trips:", error);
    throw error;
  }
};

export const getDiscoverTrips = async (limit = 20, cursor = null) => {
  try {
    const response = await mainApi.get("/api/trips/discover/feed", {
      params: { limit, cursor },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching discover trips:", error);
    throw error;
  }
};
