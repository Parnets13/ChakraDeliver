import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user: null,
  agent: null,
  token: null,
  isLoading: false,
  error: null,

  // Send OTP
  sendOtp: async phone => {
    set({isLoading: true, error: null});
    try {
      const res = await authApi.sendOtp(phone);
      set({isLoading: false});
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      set({isLoading: false, error: msg});
      throw new Error(msg);
    }
  },

  // Verify OTP
  verifyOtp: async (phone, otp) => {
    set({isLoading: true, error: null});
    try {
      const res = await authApi.verifyOtp(phone, otp);
      set({
        user: res.user,
        agent: res.agent,
        token: res.token,
        isLoading: false,
      });
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      set({isLoading: false, error: msg});
      throw new Error(msg);
    }
  },

  // Load profile
  loadProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;
      const res = await authApi.getProfile();
      set({agent: res.data, token});
      return true;
    } catch {
      return false;
    }
  },

  // Logout
  logout: async () => {
    await authApi.logout();
    set({user: null, agent: null, token: null});
  },

  clearError: () => set({error: null}),
}));
