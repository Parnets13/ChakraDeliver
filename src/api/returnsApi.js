import api from './config';

export const returnsApi = {
  // Get agent's returns
  getReturns: async () => {
    const response = await api.get('/delivery-agent/returns');
    return response.data;
  },

  // Create a return
  createReturn: async (deliveryId, reason, docketId) => {
    const response = await api.post('/delivery-agent/returns', {
      deliveryId,
      reason,
      docketId,
    });
    return response.data;
  },

  // Get notifications
  getNotifications: async () => {
    const response = await api.get('/delivery-agent/notifications');
    return response.data;
  },

  // Mark notifications as read
  markNotificationsRead: async (ids = []) => {
    const response = await api.patch('/delivery-agent/notifications/read', { ids });
    return response.data;
  },

  // Register FCM token for push notifications
  registerFcmToken: async (token) => {
    const response = await api.post('/delivery-agent/fcm-token', { token });
    return response.data;
  },
};
