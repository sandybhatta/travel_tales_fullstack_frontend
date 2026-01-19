import mainApi from "./axios.js";

export const getPostDetails = async (postId) => {
  try {
    const response = await mainApi.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching post details:", error);
    throw error;
  }
};

export const createComment = async (postId, content) => {
    const response = await mainApi.post(`/api/comment/${postId}`, { content });
    return response.data;
};

export const getUserFollowings = async (userId) => {
    const response = await mainApi.get(`/api/user/${userId}/following`);
    return response.data;
}
