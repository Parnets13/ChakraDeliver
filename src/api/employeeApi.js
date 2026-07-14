import api from './config';

/**
 * Convert display date "DD/MM/YYYY" → ISO "YYYY-MM-DD"
 * Returns the value unchanged if it's already in ISO format or unrecognised.
 */
function toISODate(val) {
  if (!val) return val;
  // Already ISO: "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Display format: "DD/MM/YYYY"
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
    const [dd, mm, yyyy] = val.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  return val;
}

export const employeeApi = {
  /**
   * POST /api/employees/register
   * Sends multipart/form-data so profile photo can be included.
   * joiningDate is normalised to YYYY-MM-DD before sending.
   * Returns { success, message, userId, data: { _id, fullName, email, ... } }
   */
  register: async employeeData => {
    const formData = new FormData();

    const textFields = [
      'fullName',
      'mobileNumber',
      'email',
      'password',
      'department',
      'designation',
      'joiningDate',   // converted to ISO below
      'userRole',      // 'employee' or 'delivery_logistics'
      // Optional
      'gender',
      'gstNumber',
      'panNumber',
      'industry',
      'address',
      'drivingLicence',
      'vehicleNumber',
    ];

    textFields.forEach(field => {
      let val = employeeData[field];
      if (val === undefined || val === null || val === '') return;
      // Normalise date field to YYYY-MM-DD for backend
      if (field === 'joiningDate') val = toISODate(String(val));
      formData.append(field, String(val));
    });

    // Profile photo (optional)
    if (employeeData.profilePhoto) {
      const photo = employeeData.profilePhoto;
      formData.append('profilePhoto', {
        uri:  photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.fileName || `emp_${Date.now()}.jpg`,
      });
    }

    const response = await api.post('/employees/register', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return response.data;
  },
};
