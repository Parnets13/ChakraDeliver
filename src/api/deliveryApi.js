import api from './config';

export const deliveryApi = {
  // Get today's deliveries
  getToday: async () => {
    const response = await api.get('/delivery-agent/deliveries/today');
    return response.data;
  },

  // Get delivery stats
  getStats: async () => {
    const response = await api.get('/delivery-agent/deliveries/stats');
    return response.data;
  },

  // Get delivery by ID
  getById: async id => {
    const response = await api.get(`/delivery-agent/deliveries/${id}`);
    return response.data;
  },

  // Start delivery (pending → in_transit)
  startDelivery: async (id) => {
    const response = await api.patch(`/delivery-agent/deliveries/${id}/start`);
    return response.data;
  },

  // Mark delivery as delivered
  markDelivered: async (id, data = {}) => {
    const response = await api.patch(`/delivery-agent/deliveries/${id}/deliver`, data);
    return response.data;
  },

  // Mark delivery as failed
  markFailed: async (id, reason) => {
    const response = await api.patch(`/delivery-agent/deliveries/${id}/fail`, {reason});
    return response.data;
  },

  // Upload POD (multipart form data with files)
  uploadPOD: async (id, podData) => {
    const formData = new FormData();

    // Signature — could be a base64 data URI or a file URI
    if (podData.signature) {
      if (podData.signature.startsWith('data:')) {
        // Base64 signature from signature pad — send as file
        formData.append('signature', {
          uri: podData.signature,
          type: 'image/png',
          name: `sig_${Date.now()}.png`,
        });
      } else {
        formData.append('signature', {
          uri: podData.signature,
          type: 'image/png',
          name: `sig_${Date.now()}.png`,
        });
      }
    }

    // Photo — file URI from camera
    if (podData.photo) {
      formData.append('photo', {
        uri: podData.photo,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      });
    }

    if (podData.notes) formData.append('notes', podData.notes);
    if (podData.receivedBy) formData.append('receivedBy', podData.receivedBy);

    const response = await api.post(`/delivery-agent/deliveries/${id}/pod`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update agent location
  updateLocation: async (latitude, longitude) => {
    const response = await api.patch('/delivery-agent/location', {latitude, longitude});
    return response.data;
  },

  // Scan lookup - find delivery by barcode/QR code
  scanLookup: async code => {
    const response = await api.get(`/delivery-agent/scan/${encodeURIComponent(code)}`);
    return response.data;
  },

  // Delivery history (all past deliveries)
  getHistory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/delivery-agent/deliveries/history${query ? '?' + query : ''}`);
    return response.data;
  },
};
