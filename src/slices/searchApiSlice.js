import { apiSlice } from "./apiSlice";

export const searchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: (query) => ({
        url: `/api/search`,
        params: { q: query },
      }),
    }),
    userSearch: builder.query({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/api/search/users",
        params: { q: query, page, limit },
      }),
    }),
    postSearch: builder.query({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/api/search/posts",
        params: { q: query, page, limit },
      }),
    }),
    tripSearch: builder.query({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/api/search/trips",
        params: { q: query, page, limit },
      }),
    }),
    getSearchHistory: builder.query({
      query: () => "/api/search/history",
      providesTags: ["History"],
    }),
    deleteOneHistory: builder.mutation({
      query: (id) => ({
        url: `/api/search/history/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["History"],
    }),
    deleteAllHistory: builder.mutation({
      query: () => ({
        url: "/api/search/history/",
        method: "DELETE",
      }),
      invalidatesTags: ["History"],
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useUserSearchQuery,
  usePostSearchQuery,
  useTripSearchQuery,
  useGetSearchHistoryQuery,
  useDeleteOneHistoryMutation,
  useDeleteAllHistoryMutation,
  // Lazy queries
  useLazyGlobalSearchQuery,
  useLazyUserSearchQuery,
  useLazyPostSearchQuery,
  useLazyTripSearchQuery,
} = searchApiSlice;
