import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadFiles as nativeUploadFiles } from '@dr.pogodin/react-native-fs';

const API_BASE_URL = 'http://192.168.74.163:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const describeError = (err) => {
  if (err.response) {
    return {
      kind: 'server-responded',
      status: err.response.status,
      data: err.response.data,
      url: err.config?.url,
    };
  }
  return {
    kind: 'no-server-response',
    message: err.message || String(err),
    url: err.config?.url,
    method: err.config?.method,
    baseURL: err.config?.baseURL,
    code: err.code,
  };
};

// Attach the stored auth token automatically to every request.
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Attach token automatically if present
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const getStoredToken = () => AsyncStorage.getItem('token');

export const clearStoredToken = () => AsyncStorage.removeItem('token');

// =====================
// Auth
// =====================
export const registerDriver = (data) =>
  api.post('/api/auth/register', data);

export const loginDriver = (data) =>
  api.post('/api/auth/login', data);

// =====================
// Driver Profile / Status
// =====================
export const getDriverProfile = () =>
  api.get('/api/driver/profile');

export const updateDriverProfile = (data) =>
  api.put('/api/driver/profile', data);

export const getDriverStatus = () =>
  api.get('/api/driver/status');

export const updateDriverStatus = (status) =>
  api.put('/api/driver/status', { status });

export const updateDriverLocation = (latitude, longitude) =>
  api.put('/api/driver/location', { latitude, longitude });

// =====================
// Documents
// =====================
// Used to fail with "Network Error" / "Network request failed" because both
// axios and fetch route multipart bodies through RN's JS networking layer on
// Android. The native RNFS.uploadFiles() builds the multipart body in Java
// (OkHttp), bypassing that broken path, and returns a real HTTP status.
// files: [{ field, uri (file:// path), type, name }]
export const uploadDocuments = async (files) => {
  const token = await AsyncStorage.getItem('token');

  const nativeFiles = files
    .filter(Boolean)
    .map((f) => ({
      name: f.field,
      filename: f.name,
      filepath: f.uri.replace(/^file:\/\//, ''),
      filetype: f.type || 'image/jpeg',
    }));

  let result;
  try {
    const { promise } = nativeUploadFiles({
      toUrl: `${API_BASE_URL}/api/documents/upload`,
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      files: nativeFiles,
    });
    result = await promise;
  } catch (e) {
    const error = new Error(e.message || 'Network Error');
    error.code = 'ERR_NETWORK';
    error.config = { url: '/api/documents/upload', method: 'post', baseURL: API_BASE_URL };
    throw error;
  }

  let data = null;
  try {
    data = JSON.parse(result.body);
  } catch {
    data = result.body;
  }

  if (result.statusCode >= 400) {
    const error = new Error(data?.message || `Upload failed with status ${result.statusCode}`);
    error.response = { status: result.statusCode, data };
    error.config = { url: '/api/documents/upload', method: 'post', baseURL: API_BASE_URL };
    throw error;
  }

  return data;
};

// =====================
// Documents
// =====================
export const getDocuments = () =>
  api.get('/api/documents');

// =====================
// Vehicles
// =====================
export const getVehicles = () =>
  api.get('/api/vehicle');

export const addVehicle = (data) =>
  api.post('/api/vehicle', data);

// =====================
// Bookings / Trips
// =====================
export const getCurrentBooking = () =>
  api.get('/api/bookings/current');

export const getUpcomingTrips = () =>
  api.get('/api/bookings/upcoming');

export const getCurrentRequest = () =>
  api.get('/api/bookings/current-request');

export const acceptBooking = (bookingNumber) =>
  api.put(`/api/bookings/accept/${bookingNumber}`);

export const rejectBooking = (bookingNumber) =>
  api.put(`/api/bookings/reject/${bookingNumber}`);

export const reachedPickup = (bookingNumber) =>
  api.put(`/api/bookings/reached/${bookingNumber}`);

export const startTrip = (bookingNumber) =>
  api.put(`/api/bookings/start/${bookingNumber}`);

export const completeTrip = (bookingNumber) =>
  api.put(`/api/bookings/complete/${bookingNumber}`);

export const cancelTrip = (bookingNumber, reason) =>
  api.put(`/api/bookings/cancel/${bookingNumber}`, { reason });

export const getTripHistory = () =>
  api.get('/api/bookings/history');

export const getTodayTrips = () =>
  api.get('/api/bookings/history/today');

// =====================
// Customer Driver Requests
// =====================
export const getPendingDriverRequests = () =>
  api.get('/api/driver/requests/pending');

export const acceptDriverRequest = (requestId) =>
  api.put(`/api/driver/requests/${requestId}/accept`);

export const rejectDriverRequest = (requestId) =>
  api.put(`/api/driver/requests/${requestId}/reject`);

// =====================
// Acting driver booking flow (1 booking -> up to 10 driver requests)
// =====================
export const getPendingBookingRequests = () =>
  api.get('/api/action/drivers/booking-requests');

export const acceptBookingRequest = (requestId) =>
  api.post(`/api/action/drivers/booking-requests/${requestId}/accept`);

export const rejectBookingRequest = (requestId) =>
  api.post(`/api/action/drivers/booking-requests/${requestId}/reject`);

// =====================
// Acting driver trip — action bookings (start/end by OTP)
// =====================
export const getActionDriverUpcoming = () =>
  api.get('/api/action/drivers/bookings/upcoming');

export const startActionTrip = (bookingId, otp) =>
  api.post(`/api/action/drivers/bookings/${bookingId}/start`, { otp });

export const endActionTrip = (bookingId, otp) =>
  api.post(`/api/action/drivers/bookings/${bookingId}/end`, { otp });

// =====================
// OTP
// =====================
export const generateOtp = (bookingNumber) =>
  api.post('/api/otp/generate', { bookingNumber });

export const verifyOtp = (bookingNumber, otp) =>
  api.post('/api/otp/verify', { bookingNumber, otp });

// =====================
// Dashboard & Earnings
// =====================
export const getDashboard = () =>
  api.get('/api/dashboard');

export const getEarnings = () =>
  api.get('/api/earnings');

export const getSettings = () =>
  api.get('/api/settings');

export const updateSettings = (data) =>
  api.put('/api/settings', data);

export const updateNotification = (notifications) =>
  api.put('/api/settings/notification', { notifications });

export default api;