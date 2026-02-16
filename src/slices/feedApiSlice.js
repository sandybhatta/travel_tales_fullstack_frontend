import { apiSlice } from "./apiSlice";

export const feedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUniversalFeed: builder.query({
      query: ({ page = 1, limit = 20 }) => `/api/user/feed?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems) => {
        if (newItems.page === 1) {
          currentCache.feed = newItems.feed;
        } else {
          currentCache.feed.push(...newItems.feed);
        }
        currentCache.hasMore = newItems.hasMore;
        currentCache.page = newItems.page;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
      providesTags: ["Feed"],
    }),
  }),
});

export const { useGetUniversalFeedQuery } = feedApiSlice;
