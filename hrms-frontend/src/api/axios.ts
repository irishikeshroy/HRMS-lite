import axios from 'axios';

// The baseUrl pulls automatically from Vite's built in Environment Pipeline
// Locally this reads .env.dev, and in Vercel this reads the Production variables
const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-type': 'application/json',
    },
});

// Optionally add interceptors here to globally handle 401s or 500s 
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error Response:", error.response);
        return Promise.reject(error);
    }
);
