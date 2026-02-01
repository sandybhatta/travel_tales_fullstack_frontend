import { apiSlice } from "./apiSlice";

export const commentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRootComment: builder.mutation({
      query: ({ postId, content, mentions }) => ({
        url: `/api/comment/${postId}`,
        method: "POST",
        body: { content, mentions },
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Comment", id: postId },
      ],
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
          const patchResult = dispatch(
             apiSlice.util.updateQueryData('getUniversalFeed', undefined, (draft) => {
                const post = draft.feed.find(item => item.data._id === postId);
                if (post) {
                    post.data.commentCount = (post.data.commentCount || 0) + 1;
                }
             })
          );
          const detailPatchResult = dispatch(
              apiSlice.util.updateQueryData('getPostDetails', postId, (draft) => {
                  draft.commentsCount = (draft.commentsCount || 0) + 1;
              })
          );
          try {
             await queryFulfilled;
          } catch {
             patchResult.undo();
             detailPatchResult.undo();
          }
       }
    }),
    getPostComments: builder.query({
      query: (postId) => `/api/comment/${postId}`,
      providesTags: (result, error, postId) => [
        { type: "Comment", id: postId },
      ],
    }),
    getReplies: builder.query({
      query: ({ postId, parentCommentId }) =>
        `/api/comment/${postId}/${parentCommentId}`,
      providesTags: (result, error, { parentCommentId }) => [
        { type: "Comment", id: parentCommentId },
      ],
    }),
    replyToComment: builder.mutation({
      query: ({ postId, rootCommentId, parentCommentId, content, mentions }) => ({
        url: `/api/comment/${postId}/${rootCommentId}/${parentCommentId}/reply`,
        method: "POST",
        body: { content, mentions },
      }),
      invalidatesTags: (result, error, { postId, parentCommentId }) => [
        { type: "Comment", id: postId },
        { type: "Comment", id: parentCommentId },
      ],
    }),
    editComment: builder.mutation({
      query: ({ commentId, content }) => ({
        url: `/api/comment/${commentId}`,
        method: "PATCH",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),
    deleteComment: builder.mutation({
      query: (commentId) => ({
        url: `/api/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Comment"],
    }),
    getCommentLikes: builder.query({
      query: (commentId) => `/api/comment/${commentId}/likes`,
      providesTags: (result, error, commentId) => [
        { type: "CommentLikes", id: commentId },
      ],
    }),
    getMentionedComments: builder.query({
      query: () => '/api/comment/mentioned-comments',
    }),
    toggleCommentLike: builder.mutation({
      query: (commentId) => ({
        url: `/api/comment/${commentId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, commentId) => [
        { type: "Comment", id: commentId },
        { type: "CommentLikes", id: commentId },
      ],
    }),
  }),
});

export const {
  useCreateRootCommentMutation,
  useGetPostCommentsQuery,
  useGetRepliesQuery,
  useReplyToCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useGetCommentLikesQuery,
  useLazyGetCommentLikesQuery,
  useGetMentionedCommentsQuery,
  useToggleCommentLikeMutation,
} = commentApiSlice;
