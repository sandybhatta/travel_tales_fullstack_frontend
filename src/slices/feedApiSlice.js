import { apiSlice } from "./apiSlice";

export const feedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUniversalFeed: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/api/user/feed",
        params: { page, limit },
      }),
      providesTags: ["Feed"],
      // Merge results for infinite scroll
      serializeQueryArgs: ({ endpointName }) => {
        return endpointName;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg?.page === 1) {
            return newItems;
        }
        currentCache.feed.push(...newItems.feed);
        currentCache.hasMore = newItems.hasMore;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
    }),
  }),
});

export const { useGetUniversalFeedQuery } = feedApiSlice;
