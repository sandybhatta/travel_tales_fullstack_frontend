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

export const createComment = async (postId, content, mentions = []) => {
    const response = await mainApi.post(`/api/comment/${postId}`, { content, mentions });
    return response.data;
};

export const getUserFollowings = async (userId) => {
    const response = await mainApi.get(`/api/user/${userId}/following`);
    return response.data;
}

export const getPostComments = async (postId) => {
    const response = await mainApi.get(`/api/comment/${postId}`);
    return response.data;
};

export const getReplies = async (postId, parentCommentId) => {
    const response = await mainApi.get(`/api/comment/${postId}/${parentCommentId}`);
    return response.data;
};

export const replyToComment = async (postId, rootCommentId, parentCommentId, content, mentions = []) => {
    const response = await mainApi.post(`/api/comment/${postId}/${rootCommentId}/${parentCommentId}/reply`, { content, mentions });
    return response.data;
};
