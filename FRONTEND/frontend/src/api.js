import axios from 'axios';

const API = axios.create({
    // All requests will be relative to this base,
    // e.g. API.get('/services/') -> http://127.0.0.1:8000/api/services/
    baseURL: 'http://127.0.0.1:8000/api',
});

// Add the token to every request if we are logged in
API.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

export default API;