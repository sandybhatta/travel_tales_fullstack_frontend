import mainApi from "./axios.js";

// Post Like/Unlike
export const togglePostLike = async (postId) => {
  try {
    const response = await mainApi.patch(`/api/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};

// Trip Like/Unlike
export const toggleTripLike = async (tripId) => {
  try {
    const response = await mainApi.post(`/api/trips/${tripId}/like`);
    return response.data;
  } catch (error) {
    console.error("Error toggling trip like:", error);
    throw error;
  }
};

// Get Post Likes
export const getPostLikes = async (postId) => {
  try {
    const response = await mainApi.get(`/api/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post likes:", error);
    throw error;
  }
};

// Get Trip Likes
export const getTripLikes = async (tripId) => {
  try {
    const response = await mainApi.get(`/api/trips/${tripId}/likes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching trip likes:", error);
    throw error;
  }
};

// Follow User
export const followUser = async (userId) => {
  try {
    const response = await mainApi.post(`/api/user/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

// Unfollow User
export const unfollowUser = async (userId) => {
  try {
    const response = await mainApi.post(`/api/user/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};
