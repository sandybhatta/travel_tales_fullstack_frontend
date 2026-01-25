import mainApi from "./axios.js";

// Create Root Comment
export const createRootComment = async (postId, content, mentions = []) => {
  try {
    const response = await mainApi.post(`/api/comment/${postId}`, {
      content,
      mentions
    });
    return response.data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};
