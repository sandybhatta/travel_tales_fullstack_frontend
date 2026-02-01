import { apiSlice } from "./apiSlice";

export const postApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation({
      query: (formData) => ({
        url: "/api/posts",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Feed", "Post"],
    }),
    getPostDetails: builder.query({
      query: (postId) => `/api/posts/${postId}`,
      providesTags: (result, error, postId) => [{ type: "Post", id: postId }],
    }),
    getPostsByUser: builder.query({
      query: (userId) => `/api/posts/user/${userId}`,
      providesTags: (result) => 
        result 
          ? [...result.post.map(({ _id }) => ({ type: 'Post', id: _id })), 'Post']
          : ['Post'],
    }),
    getOwnPosts: builder.query({
      query: () => `/api/posts/me`,
      providesTags: (result) => 
        result 
          ? [...result.post.map(({ _id }) => ({ type: 'Post', id: _id })), 'Post']
          : ['Post'],
    }),
    editPost: builder.mutation({
      query: ({ postId, data }) => ({
        url: `/api/posts/${postId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: "Post", id: postId },
        "Feed",
      ],
    }),
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post", "Feed"],
    }),
    sharePost: builder.mutation({
      query: ({ postId, data }) => ({
        url: `/api/posts/${postId}/share`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Post", "Feed"],
    }),
    togglePostLike: builder.mutation({
      query: (postId) => ({
        url: `/api/posts/${postId}/like`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, postId) => [
        { type: "Post", id: postId },
        { type: "PostLikes", id: postId },
      ],
      async onQueryStarted(postId, { dispatch, queryFulfilled, getState }) {
        const { _id, username, avatar } = getState().user;
        
        // Optimistic update for getUniversalFeed
        // We need to find all cache entries for getUniversalFeed and update them
        // Since getUniversalFeed has pages, it's tricky.
        // But since we use merge, maybe there's only one entry?
        // No, merge merges into the cache for a specific arg. 
        // If args change (page 1, page 2), they might be separate entries OR merged if serializeQueryArgs is used.
        // In feedApiSlice, I used serializeQueryArgs: ({ endpointName }) => endpointName;
        // This means all pages share the SAME cache entry "getUniversalFeed(undefined)".
        
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getUniversalFeed', undefined, (draft) => {
             // draft is the response data { feed: [], hasMore: ... }
             const post = draft.feed.find(item => item.data._id === postId);
             if (post) {
                const isLiked = post.data.isLikedByViewer;
                if (isLiked) {
                    post.data.likes = post.data.likes.filter(l => (l._id || l) !== _id);
                    post.data.isLikedByViewer = false;
                    post.data.likeCount--;
                } else {
                    post.data.likes.push({ _id, username, avatar });
                    post.data.isLikedByViewer = true;
                    post.data.likeCount++;
                }
             }
          })
        );

        // Also update getPostDetails if it's open
        const detailPatchResult = dispatch(
            apiSlice.util.updateQueryData('getPostDetails', postId, (draft) => {
                 const isLiked = draft.isLikedByViewer;
                 if (isLiked) {
                    draft.likes = draft.likes.filter(l => (l._id || l) !== _id);
                    draft.isLikedByViewer = false;
                 } else {
                    draft.likes.push({ _id, username, avatar });
                    draft.isLikedByViewer = true;
                 }
            })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
          detailPatchResult.undo();
        }
      },
    }),
    getPostLikes: builder.query({
      query: (postId) => `/api/posts/${postId}/likes`,
      providesTags: (result, error, postId) => [
        { type: "PostLikes", id: postId },
      ],
    }),
    getMentionedPosts: builder.query({
      query: () => '/api/posts/mentioned-posts',
      providesTags: ['Post'],
    }),
    getTaggedPosts: builder.query({
      query: () => '/api/posts/tagged-posts',
      providesTags: ['Post'],
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetPostDetailsQuery,
  useGetPostsByUserQuery,
  useGetOwnPostsQuery,
  useEditPostMutation,
  useDeletePostMutation,
  useSharePostMutation,
  useTogglePostLikeMutation,
  useGetPostLikesQuery,
  useGetMentionedPostsQuery,
  useGetTaggedPostsQuery,
} = postApiSlice;
