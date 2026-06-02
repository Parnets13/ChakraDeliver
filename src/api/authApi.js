import api from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = {
  // Send OTP to phone number
  sendOtp: async phone => {
    const response = await api.post('/delivery-agent/send-otp', {phone});
    return response.data;
  },

  // Verify OTP and login
  verifyOtp: async (phone, otp) => {
    const response = await api.post('/delivery-agent/verify-otp', {phone, otp});
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  // Get agent profile
  getProfile: async () => {
    const response = await api.get('/delivery-agent/profile');
    return response.data;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
  },
};
