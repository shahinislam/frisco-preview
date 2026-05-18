import axios from "axios";
import https from "https";

// Create HTTPS agent with connection pooling
const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 3000,
    maxSockets: 10,
    maxFreeSockets: 5,
    timeout: 60000,
});

const http = axios.create({
    baseURL: "https://backend.ercare24.com/api",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-type": "application/json"
    },
    timeout: 30000, // 30 second timeout
    httpsAgent: httpsAgent,
    withCredentials: true,
});

// Add response interceptor for error handling
http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout:', error.config.url);
        }
        return Promise.reject(error);
    }
);

export default http;
