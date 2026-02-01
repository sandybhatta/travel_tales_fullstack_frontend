import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchMentionableUsers: builder.query({
      query: (query) => `/api/user/search-mentions?q=${query}`,
    }),
    getUserProfile: builder.query({
      query: (userId) => `/api/user/${userId}/profile`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),
    getMutualFollowers: builder.query({
      query: ({ userId, skip = 0, limit = 50 }) => ({
        url: `/api/user/${userId}/mutual-follower`,
        params: { skip, limit },
      }),
      providesTags: ["User"],
    }),
    getCloseFriends: builder.query({
      query: () => `/api/user/close-friends`,
      providesTags: ["User"],
    }),
    getUserBookmarks: builder.query({
        query: () => `/api/user/bookmarks`,
        providesTags: ["Post", "Trip"], // Bookmarks can be posts or trips
    }),
    addCloseFriend: builder.mutation({
      query: (userId) => ({
        url: `/api/user/close-friends/${userId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
    removeCloseFriend: builder.mutation({
      query: (userId) => ({
        url: `/api/user/close-friends/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/api/user/follow/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Post", "Trip"],
    }),
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/api/user/unfollow/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["User", "Post", "Trip"],
    }),
    getUserFollowings: builder.query({
      query: ({ userId, skip = 0, limit = 10 }) => ({
        url: `/api/user/${userId}/following`,
        params: { skip, limit },
      }),
      providesTags: ["User"],
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.userId}`; // Cache key per user
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.skip === 0) {
            return newItems;
        }
        currentCache.followingList.push(...newItems.followingList);
        currentCache.hasMore = newItems.hasMore;
        currentCache.count = newItems.count;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.skip !== previousArg?.skip;
      },
    }),
    getUserFollowers: builder.query({
      query: (userId) => `/api/user/${userId}/followers`,
      providesTags: ["User"],
    }),
    getSuggestions: builder.query({
      query: () => "/api/user/users",
      providesTags: ["User"],
    }),
    bookmarkPost: builder.mutation({
      query: (postId) => ({
        url: `/api/user/bookmark/${postId}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, postId) => [{ type: "Post", id: postId }],
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
            apiSlice.util.updateQueryData('getPostDetails', postId, (draft) => {
                 const isBookmarked = draft.isBookmarked;
                 if (isBookmarked) {
                    draft.isBookmarked = false;
                    draft.bookmarkCount--;
                 } else {
                    draft.isBookmarked = true;
                    draft.bookmarkCount++;
                 }
            })
        );
        try {
            await queryFulfilled;
        } catch {
            patchResult.undo();
        }
      }
    }),
    verifyEmailChange: builder.mutation({
      query: (token) => ({
        url: `/api/user/verify-email-change?token=${token}`,
        method: "POST",
      }),
    }),
    updatePassword: builder.mutation({
      query: (data) => ({
        url: "/api/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/api/user/update-profile",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changeUsername: builder.mutation({
      query: (data) => ({
        url: "/api/user/change-username",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    changeEmail: builder.mutation({
      query: (data) => ({
        url: "/api/user/change-email",
        method: "PATCH",
        body: data,
      }),
    }),
    deactivateUser: builder.mutation({
      query: (data) => ({
        url: "/api/auth/deactivate-user",
        method: "POST",
        body: data,
      }),
    }),
    deleteUser: builder.mutation({
      query: (data) => ({
        url: "/api/user/delete",
        method: "DELETE",
        body: data,
      }),
    }),
    updatePrivacy: builder.mutation({
      query: (data) => ({
        url: "/api/user/settings/privacy",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    getBlockedUsers: builder.query({
      query: () => "/api/user/settings/blocked",
      providesTags: ["BlockedUsers"],
    }),
    unblockUser: builder.mutation({
      query: (userId) => ({
        url: `/api/user/settings/unblock/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BlockedUsers", "User"],
    }),
    getUserActivity: builder.query({
      query: (type) => `/api/user/activity/${type}`,
    }),
  }),
});

export const {
  useSearchMentionableUsersQuery,
  useLazySearchMentionableUsersQuery,
  useGetUserProfileQuery,
  useGetMutualFollowersQuery,
  useGetCloseFriendsQuery,
  useGetUserBookmarksQuery,
  useAddCloseFriendMutation,
  useRemoveCloseFriendMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetUserFollowingsQuery,
  useGetUserFollowersQuery,
  useGetSuggestionsQuery,
  useBookmarkPostMutation,
  useVerifyEmailChangeMutation,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useChangeUsernameMutation,
  useChangeEmailMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useUpdatePrivacyMutation,
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
  useGetUserActivityQuery,
  useLazyGetUserActivityQuery,
} = userApiSlice;
