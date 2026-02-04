import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAccessToken, logout } from './userSlice';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_LIVE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().user?.accessToken || localStorage.getItem("accessToken");
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const refreshBaseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BACKEND_LIVE_URL,
    credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        // try to get a new token
        const refreshResult = await refreshBaseQuery('/api/auth/refresh', api, extraOptions);

        if (refreshResult.data) {
            // store the new token
            const newAccessToken = refreshResult.data.accessToken;
            api.dispatch(setAccessToken(newAccessToken));
            
            // retry the initial query
            result = await baseQuery(args, api, extraOptions);
        } else {
            // refresh failed - logout and redirect
            api.dispatch(logout());
            window.location.href = "/login";
        }
    }
    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Trip', 'Post', 'Comment', 'Feed', 'History', 'PostLikes', 'TripLikes', 'CommentLikes', 'Notification'], // Add relevant tags here
    endpoints: (builder) => ({}),
});
