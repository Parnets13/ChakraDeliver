import {create} from 'zustand';
import {deliveryApi} from '../api/deliveryApi';
import {returnsApi} from '../api/returnsApi';

export const useDeliveryStore = create((set, get) => ({
  deliveries: [],
  stats: {today: 0, completed: 0, pending: 0, failed: 0},
  notifications: [],
  returns: [],
  isLoading: false,
  error: null,

  // Fetch today's deliveries from API
  fetchDeliveries: async () => {
    set({isLoading: true});
    try {
      const res = await deliveryApi.getToday();
      set({deliveries: res.data, isLoading: false});
    } catch (err) {
      set({isLoading: false, error: err.message});
    }
  },

  // Fetch stats from API
  fetchStats: async () => {
    try {
      const res = await deliveryApi.getStats();
      set({stats: res.data});
    } catch (err) {
      console.log('Stats fetch error:', err.message);
    }
  },

  // Get stats (local)
  getStats: () => get().stats,

  // Get filtered deliveries
  getFilteredDeliveries: filter => {
    const deliveries = get().deliveries;
    if (filter === 'All') return deliveries;
    return deliveries.filter(d => d.status === filter.toLowerCase());
  },

  // Get next pending delivery
  getNextDelivery: () => {
    return get().deliveries.find(d => d.status === 'pending');
  },

  // Start delivery (pending → in_transit) via API
  startDelivery: async id => {
    try {
      await deliveryApi.startDelivery(id);
      set(state => ({
        deliveries: state.deliveries.map(d =>
          d._id === id ? {...d, status: 'in_transit'} : d,
        ),
        stats: {
          ...state.stats,
          pending: state.stats.pending - 1,
        },
      }));
      return true;
    } catch (err) {
      console.log('Start delivery error:', err.message);
      return false;
    }
  },

  // Mark delivered via API
  markDelivered: async id => {
    try {
      await deliveryApi.markDelivered(id);
      set(state => ({
        deliveries: state.deliveries.map(d =>
          d._id === id ? {...d, status: 'delivered'} : d,
        ),
        stats: {
          ...state.stats,
          completed: state.stats.completed + 1,
          pending: state.stats.pending - 1,
        },
      }));
    } catch (err) {
      console.log('Mark delivered error:', err.message);
    }
  },

  // Mark failed via API
  markFailed: async (id, reason) => {
    try {
      await deliveryApi.markFailed(id, reason);
      set(state => ({
        deliveries: state.deliveries.map(d =>
          d._id === id ? {...d, status: 'failed', failReason: reason} : d,
        ),
        stats: {
          ...state.stats,
          failed: state.stats.failed + 1,
          pending: state.stats.pending - 1,
        },
      }));
    } catch (err) {
      console.log('Mark failed error:', err.message);
    }
  },

  // Upload POD via API
  uploadPOD: async (id, podData) => {
    try {
      await deliveryApi.uploadPOD(id, podData);
      set(state => ({
        deliveries: state.deliveries.map(d =>
          d._id === id ? {...d, status: 'delivered', pod: podData} : d,
        ),
      }));
      return true;
    } catch (err) {
      console.log('POD upload error:', err.message);
      return false;
    }
  },

  // Fetch returns
  fetchReturns: async () => {
    try {
      const res = await returnsApi.getReturns();
      set({returns: res.data});
    } catch (err) {
      console.log('Returns fetch error:', err.message);
    }
  },

  // Create return
  createReturn: async (deliveryId, reason, docketId) => {
    try {
      await returnsApi.createReturn(deliveryId, reason, docketId);
      // Refresh deliveries
      get().fetchDeliveries();
    } catch (err) {
      console.log('Create return error:', err.message);
    }
  },

  // Fetch notifications
  fetchNotifications: async () => {
    try {
      const res = await returnsApi.getNotifications();
      set({notifications: res.data || []});
    } catch (err) {
      console.log('Notifications fetch error:', err.message);
    }
  },

  // Get unread count
  getUnreadCount: () => {
    return get().notifications.filter(n => !n.read).length;
  },

  // Mark notifications as read
  markNotificationsRead: async (ids = []) => {
    try {
      await returnsApi.markNotificationsRead(ids);
      set(state => ({
        notifications: state.notifications.map(n =>
          ids.length === 0 || ids.includes(n._id) ? {...n, read: true} : n,
        ),
      }));
    } catch (err) {
      console.log('Mark read error:', err.message);
    }
  },

  // Update location
  updateLocation: async (latitude, longitude) => {
    try {
      await deliveryApi.updateLocation(latitude, longitude);
    } catch (err) {
      console.log('Location update error:', err.message);
    }
  },
}));
