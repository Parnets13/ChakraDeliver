import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../api/authApi';

export const useAuthStore = create((set, get) => ({
  user:            null,
  agent:           null,
  token:           null,
  userType:        null,
  isOtpVerified:   false,   // true only after OTP verified (or OTP skipped for accounts with no phone)
  isLoading:       false,
  isSendingOtp:    false,   // separate flag so login button stays active
  error:           null,

  // ── Login with email + password ──────────────────────────────────────────
  // Stores credentials in state BUT does NOT set isOtpVerified.
  // App must route to OTPVerification next.
  loginWithEmail: async (email, password) => {
    set({isLoading: true, error: null});
    try {
      const res = await authApi.loginWithEmail(email, password);
      const agentWithName = {
        ...res.agent,
        name:         res.user?.name         || res.agent?.name        || '',
        email:        res.user?.email        || email,
        phone:        res.user?.phone        || res.agent?.phone       || '',
        department:   res.user?.department   || res.agent?.department  || res.agent?.zone || '',
        designation:  res.user?.designation  || res.agent?.designation || '',
        gender:       res.user?.gender       || '',
        gstNumber:    res.user?.gstNumber    || '',
        panNumber:    res.user?.panNumber    || '',
        industry:     res.user?.industry     || '',
        address:      res.user?.address      || '',
        profilePhoto: res.user?.profilePhoto || '',
        joiningDate:  res.user?.joiningDate  || '',
        status:       res.user?.status       || res.agent?.status      || 'Active',
        userRole:     res.user?.role         || res.userType           || '',
      };
      // Persist userId so session restore can re-fetch the correct profile
      if (res.user?.id) {
        await AsyncStorage.setItem('userId', String(res.user.id));
      }
      // Save plain-text password locally on device so Profile can display it
      await AsyncStorage.setItem('userPassword', password);
      set({
        user:          res.user,
        agent:         agentWithName,
        token:         res.token,
        userType:      res.userType || 'delivery_agent',
        isOtpVerified: false,   // must complete OTP step
        isLoading:     false,
      });
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      set({isLoading: false, error: msg});
      throw new Error(msg);
    }
  },

  // ── Send OTP — accepts { phone } or { email } ────────────────────────────
  sendOtp: async ({phone, email} = {}) => {
    set({isSendingOtp: true, error: null});
    try {
      const res = await authApi.sendOtp({phone, email});
      set({isSendingOtp: false});
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      set({isSendingOtp: false, error: msg});
      throw new Error(msg);
    }
  },

  // ── Verify OTP — updates store fully and sets isOtpVerified = true ───────
  verifyOtp: async (phone, otp) => {
    set({isLoading: true, error: null});
    try {
      const res = await authApi.verifyOtp(phone, otp);
      // verifyOtp response has fresh token + full user/agent data
      const agentWithName = {
        ...res.agent,
        name:         res.user?.name         || res.agent?.name  || '',
        email:        res.user?.email        || '',
        phone:        res.user?.phone        || res.agent?.phone || phone,
        department:   res.user?.department   || res.agent?.zone  || '',
        designation:  res.user?.designation  || '',
        gender:       res.user?.gender       || '',
        gstNumber:    res.user?.gstNumber    || '',
        panNumber:    res.user?.panNumber    || '',
        industry:     res.user?.industry     || '',
        address:      res.user?.address      || '',
        profilePhoto: res.user?.profilePhoto || '',
        joiningDate:  res.user?.joiningDate  || '',
        status:       res.user?.status       || res.agent?.status || 'Active',
        userRole:     res.user?.role         || res.userType      || '',
      };
      set({
        user:          res.user,
        agent:         agentWithName,
        token:         res.token,
        userType:      res.userType || get().userType || 'delivery_agent',
        isOtpVerified: true,
        isLoading:     false,
      });
      // Persist verification flag
      await AsyncStorage.setItem('isOtpVerified', 'true');
      return res;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid OTP';
      set({isLoading: false, error: msg});
      throw new Error(msg);
    }
  },

  // ── Skip OTP (for accounts without a registered phone) ──────────────────
  skipOtpVerification: async () => {
    set({isOtpVerified: true});
    await AsyncStorage.setItem('isOtpVerified', 'true');
  },

  // ── Load saved session on app start ─────────────────────────────────────
  loadProfile: async () => {
    try {
      const token          = await AsyncStorage.getItem('authToken');
      const otpVerifiedStr = await AsyncStorage.getItem('isOtpVerified');
      const savedUserType  = await AsyncStorage.getItem('userType');
      if (!token) return false;

      const res = await authApi.getProfile();
      // authApi.getProfile returns response.data = { success, data: {...} }
      // so res.data is the actual profile object
      const p = res?.data || res;
      if (!p) return false;

      set({
        agent: {
          id:           p.id    || p._id || p.agentId,
          agentId:      p.agentId || ('EMP-' + String(p.id || p._id || '').slice(-6).toUpperCase()),
          name:         p.name         || p.fullName || '',
          email:        p.email        || '',
          phone:        p.phone        || p.mobileNumber || '',
          zone:         p.zone         || p.department   || '',
          vehicle:      p.vehicle      || p.vehicleNumber || '',
          status:       p.status       || 'Active',
          stats:        p.stats        || {totalDeliveries: 0, successfulDeliveries: 0, failedDeliveries: 0},
          successRate:  p.successRate  || '0%',
          department:   p.department   || p.zone || '',
          designation:  p.designation  || '',
          joiningDate:  p.joiningDate  || '',
          gender:       p.gender       || '',
          gstNumber:    p.gstNumber    || '',
          panNumber:    p.panNumber    || '',
          industry:     p.industry     || '',
          address:      p.address      || '',
          profilePhoto: p.profilePhoto || '',
          userRole:     p.userRole     || savedUserType || '',
        },
        token,
        userType:      savedUserType || 'delivery_agent',
        // Restore OTP verification state from storage
        isOtpVerified: otpVerifiedStr === 'true',
      });
      return true;
    } catch {
      return false;
    }
  },

  // ── Logout ───────────────────────────────────────────────────────────────
  logout: async () => {
    await authApi.logout();
    await AsyncStorage.removeItem('isOtpVerified');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('userType');
    await AsyncStorage.removeItem('userPassword');
    set({user: null, agent: null, token: null, userType: null, isOtpVerified: false});
  },

  clearError: () => set({error: null}),
}));
