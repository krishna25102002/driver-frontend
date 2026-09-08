import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.5:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token automatically if present
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

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
export const uploadDocuments = (formData) =>
  api.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

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

export default api;