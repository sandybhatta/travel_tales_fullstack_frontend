import { apiSlice } from "../slices/apiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: () => "/api/notifications",
      keepUnusedDataFor: 5,
      providesTags: ["Notification"],
    }),
    markNotificationsAsRead: builder.mutation({
      query: () => ({
        url: "/api/notifications/mark-read",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationsAsReadMutation } = notificationApiSlice;
