import { apiSlice } from "./apiSlice";

export const tripApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOwnTrips: builder.query({
      query: (userId) => `/api/trips/${userId}/own-trip`,
      providesTags: ["Trip"],
    }),
    getCollaboratedTrips: builder.query({
      query: (userId) => `/api/trips/${userId}/collaborated-trip`,
      providesTags: ["Trip"],
    }),
    getTripById: builder.query({
      query: (tripId) => `/api/trips/${tripId}`,
      providesTags: (result, error, tripId) => [{ type: "Trip", id: tripId }],
    }),
    getTripsByTag: builder.query({
      query: (tagname) => `/api/trips/tag/${tagname}`,
      providesTags: ["Trip"],
    }),
    toggleTripLike: builder.mutation({
      query: (tripId) => ({
        url: `/api/trips/${tripId}/like`,
        method: "POST",
      }),
      invalidatesTags: (result, error, tripId) => [
        { type: "Trip", id: tripId },
        { type: "TripLikes", id: tripId },
      ],
      async onQueryStarted(tripId, { dispatch, queryFulfilled, getState }) {
        const { _id, username, avatar } = getState().user;
        
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getUniversalFeed', undefined, (draft) => {
             const trip = draft.feed.find(item => item.data._id === tripId);
             if (trip) {
                const isLiked = trip.data.isLikedByViewer;
                if (isLiked) {
                    trip.data.likes = trip.data.likes.filter(l => (l._id || l) !== _id);
                    trip.data.isLikedByViewer = false;
                    trip.data.likeCount--;
                } else {
                    trip.data.likes.push({ _id, username, avatar });
                    trip.data.isLikedByViewer = true;
                    trip.data.likeCount++;
                }
             }
          })
        );
        
        const detailPatchResult = dispatch(
            apiSlice.util.updateQueryData('getTripById', tripId, (draft) => {
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
    getTripLikes: builder.query({
      query: (tripId) => `/api/trips/${tripId}/likes`,
      providesTags: (result, error, tripId) => [
        { type: "TripLikes", id: tripId },
      ],
    }),
    getArchivedTrips: builder.query({
      query: () => `/api/trips/archived-trips`,
      providesTags: ["Trip"],
    }),
    archiveTrip: builder.mutation({
      query: (tripId) => ({
        url: `/api/trips/${tripId}/archive`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trip"],
    }),
    restoreTrip: builder.mutation({
      query: (tripId) => ({
        url: `/api/trips/${tripId}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: ["Trip"],
    }),
    archiveAllTrips: builder.mutation({
      query: () => ({
        url: "/api/trips/archive-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Trip"],
    }),
    restoreAllTrips: builder.mutation({
      query: () => ({
        url: "/api/trips/restore-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Trip"],
    }),
    
    // Todos
    getTripTodos: builder.query({
      query: (tripId) => `/api/trips/${tripId}/todos`,
      providesTags: (result, error, tripId) => [{ type: "TripTodos", id: tripId }],
    }),
    addTripTodo: builder.mutation({
      query: ({ tripId, ...body }) => ({
        url: `/api/trips/${tripId}/todos`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripTodos", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),
    toggleTripTodo: builder.mutation({
      query: ({ tripId, todoId }) => ({
        url: `/api/trips/${tripId}/todos/${todoId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripTodos", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),
    deleteTripTodo: builder.mutation({
      query: ({ tripId, todoId }) => ({
        url: `/api/trips/${tripId}/todos/${todoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripTodos", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),

    // Notes
    getTripNotes: builder.query({
      query: (tripId) => `/api/trips/${tripId}/notes`,
      providesTags: (result, error, tripId) => [{ type: "TripNotes", id: tripId }],
    }),
    addTripNote: builder.mutation({
      query: ({ tripId, ...body }) => ({
        url: `/api/trips/${tripId}/notes`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripNotes", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),
    pinTripNote: builder.mutation({
      query: ({ tripId, noteId }) => ({
        url: `/api/trips/${tripId}/notes/${noteId}/pin`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripNotes", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),
    deleteTripNote: builder.mutation({
      query: ({ tripId, noteId }) => ({
        url: `/api/trips/${tripId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripNotes", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),

    // Expenses
    getTripExpenses: builder.query({
      query: (tripId) => `/api/trips/${tripId}/expenses`,
      providesTags: (result, error, tripId) => [{ type: "TripExpenses", id: tripId }],
    }),
    addTripExpense: builder.mutation({
      query: ({ tripId, ...body }) => ({
        url: `/api/trips/${tripId}/expenses`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripExpenses", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),
    deleteTripExpense: builder.mutation({
      query: ({ tripId, expenseId }) => ({
        url: `/api/trips/${tripId}/expenses/${expenseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripExpenses", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),

    // Trip Posts
    addPostsToTrip: builder.mutation({
      query: ({ tripId, posts }) => ({
        url: `/api/trips/${tripId}/posts`,
        method: "POST",
        body: { posts },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
      ],
    }),
    highlightTripPost: builder.mutation({
      query: ({ tripId, postId }) => ({
        url: `/api/trips/${tripId}/posts/${postId}/highlight`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
      ],
    }),
    removePostFromTrip: builder.mutation({
      query: ({ tripId, postId }) => ({
        url: `/api/trips/${tripId}/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
      ],
    }),

    // Management (Edit, Invite, Collaborators)
    updateTrip: builder.mutation({
      query: ({ tripId, data }) => ({
        url: `/api/trips/${tripId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "Trip", id: tripId },
      ],
    }),
    getTripInvited: builder.query({
      query: (tripId) => `/api/trips/${tripId}/invited`,
      providesTags: (result, error, tripId) => [{ type: "TripInvited", id: tripId }],
    }),
    getTripCollaborators: builder.query({
      query: (tripId) => `/api/trips/${tripId}/collaborators`,
      providesTags: (result, error, tripId) => [{ type: "TripCollaborators", id: tripId }],
    }),
    inviteUserToTrip: builder.mutation({
      query: ({ tripId, invitee }) => ({
        url: `/api/trips/${tripId}/invite`,
        method: "POST",
        body: { invitee },
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripInvited", id: tripId },
      ],
    }),
    removeTripInvite: builder.mutation({
      query: ({ tripId, userId }) => ({
        url: `/api/trips/${tripId}/invited/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripInvited", id: tripId },
      ],
    }),
    removeTripCollaborator: builder.mutation({
      query: ({ tripId, userId }) => ({
        url: `/api/trips/${tripId}/collaborators/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { tripId }) => [
        { type: "TripCollaborators", id: tripId },
        { type: "Trip", id: tripId },
      ],
    }),

    // User Trip Invitations (Fetched from User perspective)
    getUserInvitedTrips: builder.query({
      query: () => "/api/user/invited-trips",
      providesTags: ["InvitedTrips"],
    }),
    getUserAcceptedTrips: builder.query({
      query: () => "/api/user/accepted-trips",
      providesTags: ["AcceptedTrips"],
    }),
    acceptTripInvitation: builder.mutation({
      query: (tripId) => ({
        url: `/api/trips/${tripId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["InvitedTrips", "AcceptedTrips", "Trip"],
    }),
    rejectTripInvitation: builder.mutation({
      query: (tripId) => ({
        url: `/api/user/${tripId}/reject-invitation`,
        method: "DELETE",
      }),
      invalidatesTags: ["InvitedTrips"],
    }),
    createTrip: builder.mutation({
      query: (formData) => ({
        url: "/api/trips",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Trip", "OwnTrips"],
    }),
  }),
});

export const {
  useGetOwnTripsQuery,
  useGetCollaboratedTripsQuery,
  useGetTripByIdQuery,
  useGetTripsByTagQuery,
  useToggleTripLikeMutation,
  useGetTripLikesQuery,
  useGetArchivedTripsQuery,
  useArchiveTripMutation,
  useRestoreTripMutation,
  useArchiveAllTripsMutation,
  useRestoreAllTripsMutation,
  
  // Todos
  useGetTripTodosQuery,
  useAddTripTodoMutation,
  useToggleTripTodoMutation,
  useDeleteTripTodoMutation,
  
  // Notes
  useGetTripNotesQuery,
  useAddTripNoteMutation,
  usePinTripNoteMutation,
  useDeleteTripNoteMutation,
  
  // Expenses
  useGetTripExpensesQuery,
  useAddTripExpenseMutation,
  useDeleteTripExpenseMutation,
  
  // Trip Posts
  useAddPostsToTripMutation,
  useHighlightTripPostMutation,
  useRemovePostFromTripMutation,

  // Management
  useUpdateTripMutation,
  useGetTripInvitedQuery,
  useGetTripCollaboratorsQuery,
  useInviteUserToTripMutation,
  useRemoveTripInviteMutation,
  useRemoveTripCollaboratorMutation,

  // User Invitations
  useGetUserInvitedTripsQuery,
  useGetUserAcceptedTripsQuery,
  useAcceptTripInvitationMutation,
  useRejectTripInvitationMutation,
  useCreateTripMutation,
} = tripApiSlice;
