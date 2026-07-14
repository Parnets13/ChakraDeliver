import api from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = {
  // ── Email + Password login (works for both delivery agents AND employees) ──
  loginWithEmail: async (email, password) => {
    const response = await api.post('/delivery-agent/login', {email, password});
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      // Store userType so the app knows what kind of user is logged in
      await AsyncStorage.setItem('userType', response.data.userType || 'delivery_agent');
    }
    return response.data;
  },

  // ── OTP flow (used after email/password login for 2-step verification) ───
  // Accepts { phone } OR { email } — backend resolves phone from email if needed
  sendOtp: async ({phone, email} = {}) => {
    const response = await api.post('/delivery-agent/send-otp', {phone, email});
    return response.data;
  },

  verifyOtp: async (phone, otp) => {
    const response = await api.post('/delivery-agent/verify-otp', {phone, otp});
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      if (response.data.userType) {
        await AsyncStorage.setItem('userType', response.data.userType);
      }
    }
    return response.data;
  },

  // Get agent/employee profile — returns { success, data: { ...profileFields } }
  getProfile: async () => {
    const response = await api.get('/delivery-agent/profile');
    return response.data;
  },

  // Logout — clears stored token
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userType');
    await AsyncStorage.removeItem('userId');
  },
};
