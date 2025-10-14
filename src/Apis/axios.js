// mainApi.js
import axios from "axios";
import  store  from "../slices/store"; 
import { setAccessToken } from "../slices/userSlice";

const mainApi = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});


mainApi.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const reduxToken = state.user.accessToken;
    const localToken = localStorage.getItem("accessToken");
    const accessToken = reduxToken || localToken || "";

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
          "http://localhost:5000/api/auth/refresh",
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
