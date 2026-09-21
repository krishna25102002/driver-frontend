import React from 'react';
import {
  getPendingBookingRequests,
  getPendingDriverRequests,
  getCurrentRequest,
} from '../api';

const usePendingTripRequest = () => {
  const [tripRequest, setTripRequest] = React.useState(null);
  const [skipInfo, setSkipInfo] = React.useState(null);

  const loadRequest = React.useCallback(async () => {
    try {
      // Acting driver flow: customer picked this driver for an hourly booking
      const actionRes = await getPendingBookingRequests();
      const actionRequests = actionRes.data?.requests || [];

      if (actionRequests.length > 0) {
        const r = actionRequests[0];
        const customer = r.customer || {};
        setSkipInfo(actionRes.data?.strikePolicy || null);
        setTripRequest({
          id: r.requestId,
          requestId: r.requestId,
          source: 'action',
          bookingNumber: r.bookingNumber,
          user: customer.name || 'Customer',
          price: `₹${r.estimatedAmount || 0}`,
          pickup: r.pickupAddress || 'Pickup location',
          drop: r.dropAddress || 'Drop location',
          fromDate: r.fromDate,
          startTime: r.startTime,
          endTime: r.endTime,
          estimatedDurationHours: r.estimatedDurationHours || 0,
        });
        return;
      }

      // New flow: customer-driver request (direct driver booking)
      const driverReqRes = await getPendingDriverRequests();
      const driverRequest = driverReqRes.data?.request;

      if (driverRequest) {
        const customer = driverRequest.customerId || {};
        setSkipInfo(driverReqRes.data?.strikePolicy || null);
        setTripRequest({
          id: driverRequest._id,
          source: 'driverRequest',
          user: customer.fullName || customer.name || 'Customer',
          price: `₹${driverRequest.estimatedFare || 0}`,
          pickup: driverRequest.pickupAddress || 'Pickup location',
          drop: driverRequest.dropAddress || 'Drop location',
        });
        return;
      }

      // Fallback: legacy dispatch request
      const res = await getCurrentRequest();
      const booking = res.data.booking;

      if (booking) {
        const customer = booking.customerId || {};
        setSkipInfo(res.data?.strikePolicy || null);
        setTripRequest({
          id: booking._id,
          source: 'booking',
          bookingNumber: booking.bookingNumber,
          user: customer.fullName || 'Customer',
          price: `₹${booking.estimatedFare || 0}`,
          pickup: booking.pickupAddress || 'Pickup location',
          drop: booking.dropAddress || 'Drop location',
        });
      } else {
        setTripRequest(null);
        setSkipInfo(null);
      }
    } catch (err) {
      console.log('PENDING REQUEST ERR:', err.response?.data || err);
      setTripRequest(null);
      setSkipInfo(null);
    }
  }, []);

  React.useEffect(() => {
    loadRequest();
    const t = setInterval(loadRequest, 5000);
    return () => clearInterval(t);
  }, [loadRequest]);

  return { tripRequest, skipInfo };
};

export default usePendingTripRequest;