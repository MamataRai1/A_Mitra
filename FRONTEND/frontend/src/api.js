import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Add the token to every request if we are logged in (skip for refresh endpoint)
API.interceptors.request.use((config) => {
    if (config.url?.includes('token/refresh')) {
        config._isRefresh = true;
    }
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// On 401, try to refresh the access token and retry the request once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => (token ? prom.resolve(token) : prom.reject(error)));
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry if this was the refresh request or we already retried
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._isRefresh) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Wait for the in-flight refresh to finish, then retry with new token
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return API(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            return API.post('/auth/token/refresh/', { refresh: refreshToken })
                .then((res) => {
                    const newAccess = res.data.access;
                    localStorage.setItem('access_token', newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    processQueue(null, newAccess);
                    return API(originalRequest);
                })
                .catch((refreshErr) => {
                    processQueue(refreshErr, null);
                    clearAuthAndRedirect();
                    return Promise.reject(refreshErr);
                })
                .finally(() => {
                    isRefreshing = false;
                });
        }

        return Promise.reject(error);
    }
);

function clearAuthAndRedirect() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('profile_id');
    localStorage.removeItem('username');
    if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
    }
}

export default API;
