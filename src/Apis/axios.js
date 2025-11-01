// mainApi.js
import axios from "axios";
import  store  from "../slices/store"; 
import { setAccessToken } from "../slices/userSlice";

const mainApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_LIVE_URL,
  withCredentials: true,
});


mainApi.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const reduxToken = state.user.accessToken;
    const localToken = localStorage.getItem("accessToken");
    const accessToken = localToken || reduxToken || "";

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
  },
  (error) => Promise.reject(error)
);


mainApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._isRetried &&
      error.response?.data?.message === "Token expired"
    ) {
      originalRequest._isRetried = true

      try {
        const refreshRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_LIVE_URL}/api/auth/refresh`,
          { withCredentials: true }
        );

        const newAccessToken = refreshRes.data.accessToken
        store.dispatch(setAccessToken(newAccessToken))

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return mainApi(originalRequest);
      } catch (err) {
        
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default mainApi;
