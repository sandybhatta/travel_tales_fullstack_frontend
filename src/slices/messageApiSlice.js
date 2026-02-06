import { apiSlice } from "./apiSlice";

export const messageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (data) => ({
        url: "/api/message",
        method: "POST",
        body: data,
      }),
    }),
    allMessages: builder.query({
      query: (chatId) => `/api/message/${chatId}`,
    }),
    editMessage: builder.mutation({
      query: (data) => ({
        url: "/api/message/edit",
        method: "PUT",
        body: data,
      }),
    }),
    deleteMessage: builder.mutation({
      query: (data) => ({
        url: "/api/message/delete",
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useSendMessageMutation,
  useAllMessagesQuery,
  useEditMessageMutation,
  useDeleteMessageMutation
} = messageApiSlice;
