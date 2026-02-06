import { apiSlice } from "./apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    accessChat: builder.mutation({
      query: (userId) => ({
        url: "/api/chat",
        method: "POST",
        body: { userId },
      }),
    }),
    fetchChats: builder.query({
      query: () => "/api/chat",
      providesTags: ["Chat"],
    }),
    createGroupChat: builder.mutation({
      query: (data) => ({
        url: "/api/chat/group",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    renameGroup: builder.mutation({
      query: (data) => ({
        url: "/api/chat/rename",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    updateGroupDescription: builder.mutation({
      query: (data) => ({
        url: "/api/chat/description",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    addToGroup: builder.mutation({
      query: (data) => ({
        url: "/api/chat/groupadd",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    removeFromGroup: builder.mutation({
      query: (data) => ({
        url: "/api/chat/groupremove",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),
    makeCoAdmin: builder.mutation({
        query: (data) => ({
          url: "/api/chat/coadmin",
          method: "PUT",
          body: data,
        }),
        invalidatesTags: ["Chat"],
      }),
    removeCoAdmin: builder.mutation({
        query: (data) => ({
            url: "/api/chat/removecoadmin",
            method: "PUT",
            body: data,
        }),
        invalidatesTags: ["Chat"],
    }),
  }),
});

export const {
  useAccessChatMutation,
  useFetchChatsQuery,
  useCreateGroupChatMutation,
  useRenameGroupMutation,
  useUpdateGroupDescriptionMutation,
  useAddToGroupMutation,
  useRemoveFromGroupMutation,
  useMakeCoAdminMutation,
  useRemoveCoAdminMutation
} = chatApiSlice;
