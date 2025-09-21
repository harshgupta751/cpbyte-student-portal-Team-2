import axios from "axios";

const backendport = import.meta.env.VITE_BACKEND_PORT || 8080;
console.log("Backend URL:", backendport);
export const axiosInstance = axios.create({
  baseURL: `http://localhost:${backendport}/api/v1`,
  withCredentials: true,
});

let accessToken = null;
export const setAccessToken=function(token) {
  accessToken = token;
  axiosInstance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : undefined;
}

// queue for concurrent refreshes
let isRefreshing = false;
let subscribers = [];

function onRefreshed(token) {
  subscribers.forEach(cb => cb(token));
  subscribers = [];
}
function addSubscriber(cb) {
  subscribers.push(cb);
}

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // attempt refresh
      if (isRefreshing) {
        // queue it
        return new Promise((resolve, reject) => {
          addSubscriber((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const resp = await axiosInstance.post('/auth/refresh'); 
        const newAccess = resp.data.accessToken;
        setAccessToken(newAccess);
        onRefreshed(newAccess);
        isRefreshing = false;
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        isRefreshing = false;
        setAccessToken(null);
        // Either send user to login or clear state
        // e.g. window.location.href = '/login';
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
 
);
