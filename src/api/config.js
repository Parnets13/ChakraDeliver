import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CHANGE THIS to your PC's WiFi IP address
// Find it by running: ipconfig in terminal
const BASE_URL = 'http://192.168.1.32:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API]', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  error => Promise.reject(error),
);

// Handle responses
api.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    console.log('[API ERROR]', error.message, error.config?.url);
    if (status === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  },
);

export default api;
export {BASE_URL};
