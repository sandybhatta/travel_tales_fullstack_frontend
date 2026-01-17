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

export const getExploreFeed = async (page = 1, limit = 20) => {
  try {
    const response = await mainApi.get("/api/posts/feed/explore", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching explore feed:", error);
    throw error;
  }
};

// Trips Feed APIs
export const getVisibleTrips = async (page = 1, limit = 20, search = "", tag = "", sortBy = "") => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (tag) params.tag = tag;
    if (sortBy) params.sortBy = sortBy;
    
    const response = await mainApi.get("/api/trips/visible", { params });
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

export const getDiscoverFeed = async (page = 1, limit = 20) => {
  try {
    const response = await mainApi.get("/api/trips/discover/feed", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching discover feed:", error);
    throw error;
  }
};
