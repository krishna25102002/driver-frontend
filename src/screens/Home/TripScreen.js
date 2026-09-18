import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import {
  getCurrentRequest,
  getPendingDriverRequests,
  getPendingBookingRequests,
  getUpcomingTrips,
  acceptBooking,
  rejectBooking,
  acceptDriverRequest,
  rejectDriverRequest,
  acceptBookingRequest,
  rejectBookingRequest,
  getActionDriverUpcoming,
  getActionDriverHistory,
  markActionEnRoute,
  markActionArrived,
  unavailableActionBooking,
  cancelActionTrip,
} from '../../api';
import { C } from '../../theme';
import { Avatar, Pill, PrimaryButton } from '../../components/ui';

const UNAVAILABILITY_REASONS = [
  { key: 'DRIVER_VEHICLE_ISSUE', label: 'Vehicle issue' },
  { key: 'DRIVER_HEALTH_EMERGENCY', label: 'Health emergency' },
  { key: 'DRIVER_PERSONAL_EMERGENCY', label: 'Personal emergency' },
  { key: 'DRIVER_ACCIDENT', label: 'Accident' },
  { key: 'DRIVER_ROUTE_ISSUE', label: 'Route issue' },
  { key: 'DRIVER_NETWORK_ISSUE', label: 'Network / app issue' },
  { key: 'DRIVER_OTHER', label: 'Other' },
];

const CANCEL_REASONS = [
  { key: 'CUSTOMER_CHANGED_MIND', label: 'Customer changed mind' },
  { key: 'CUSTOMER_NO_SHOW', label: 'Customer not available' },
  { key: 'DRIVER_EMERGENCY', label: 'Driver emergency' },
  { key: 'WRONG_ADDRESS', label: 'Wrong pickup/drop address' },
  { key: 'VEHICLE_ISSUE', label: 'Vehicle issue' },
  { key: 'OTHER', label: 'Other' },
];

const LongTripTag = ({ value }) => (
  <Pill
    color={C.accentDark}
    bg={C.accentSoft}
    icon="send"
    style={{ marginTop: 10 }}
  >
    Long Trip — {value}
  </Pill>
);

const TripScreen = () => {
  const navigation = useNavigation();
  const [tripRequest, setTripRequest] = React.useState(null);
  const [upcomingTrips, setUpcomingTrips] = React.useState([]);
  const [activeTrip, setActiveTrip] = React.useState(null);
  const [activeStatus, setActiveStatus] = React.useState('');
  const [elapsed, setElapsed] = React.useState(0);
  const [showSkipLimitMsg, setShowSkipLimitMsg] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [actionBusy, setActionBusy] = React.useState(false);
  const [unavailableModal, setUnavailableModal] = React.useState(false);
  const [unavailableReason, setUnavailableReason] = React.useState(null);
  const [unavailableDesc, setUnavailableDesc] = React.useState('');

  const [historyTrips, setHistoryTrips] = React.useState([]);

  const [cancelModal, setCancelModal] = React.useState(false);
  const [pendingCancelTrip, setPendingCancelTrip] = React.useState(null);
  const [cancelReason, setCancelReason] = React.useState(null);
  const [cancelDesc, setCancelDesc] = React.useState('');

  const tickElapsed = React.useCallback(() => {
    setActiveTrip(prev => {
      if (!prev || !prev.startedAt) return prev;
      setElapsed(
        Math.max(
          0,
          Math.floor((Date.now() - new Date(prev.startedAt).getTime()) / 1000)
        )
      );
      return prev;
    });
  }, []);

  const loadUpcoming = React.useCallback(async () => {
    try {
      const res = await getUpcomingTrips();
      const list = (res.data?.bookings || []).map(b => {
        const customer = b.customerId || {};
        return {
          id: b._id || b.id,
          bookingNumber: b.bookingNumber,
          source: 'booking',
          user: customer.fullName || customer.name || 'Customer',
          avatar: (customer.fullName || customer.name || 'C').substring(0, 2).toUpperCase(),
          rating: '4.8',
          trips: 0,
          price: `₹${b.estimatedFare || 0}`,
          pickup: b.pickupAddress || 'Pickup location',
          drop: b.dropAddress || 'Drop location',
          longTrip: (b.estimatedDistance || 0) > 50,
          distance: `${b.estimatedDistance || 0} km • ~${b.estimatedDuration || 0} min`,
          time: 'Now',
          estimatedFare: b.estimatedFare || 0,
          acceptedAt: b.acceptedAt
            ? new Date(b.acceptedAt).toLocaleTimeString()
            : new Date().toLocaleTimeString(),
        };
      });

      // Merge in scheduled action bookings (CONFIRMED, not today) so the
      // driver can see future acting-driver trips too.
      try {
        const actionRes = await getActionDriverUpcoming();
        const todayStr = new Date().toDateString();
        const actionList = (actionRes.data?.bookings || [])
          .filter(
            b =>
              b.status === 'CONFIRMED' &&
              b.fromDate &&
              new Date(b.fromDate).toDateString() !== todayStr
          )
          .map(b => {
            const customer = b.customer || {};
            const d = new Date(b.fromDate).toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            return {
              id: b.id || b._id,
              bookingNumber: b.bookingNumber,
              source: 'actionSchedule',
              user: customer.name || 'Customer',
              avatar: (customer.name || 'C').substring(0, 2).toUpperCase(),
              rating: '4.8',
              trips: 0,
              price: `₹${b.amount || b.estimatedFare || 0}`,
              pickup: b.pickupAddress || 'Pickup location',
              drop: b.dropAddress || 'Drop location',
              longTrip: false,
              distance: `${d} • ${b.startTime || ''}–${b.endTime || ''}`,
              time: 'Scheduled',
              estimatedFare: b.amount || 0,
              acceptedAt: d,
            };
          });
        list.push(...actionList);
      } catch (err) {
        console.log('ACTION SCHEDULE ERR:', err.response?.data || err);
      }

      setUpcomingTrips(list);
    } catch (err) {
      console.log('UPCOMING ERR:', err.response?.data || err);
    }
  }, []);

  const loadActionUpcoming = React.useCallback(async () => {
    try {
      const res = await getActionDriverUpcoming();
      const list = res.data?.bookings || [];
      // A CONFIRMED trip on today's date -> Start button; ONGOING -> End button + timer.
      const todayStr = new Date().toDateString();
      const startable = list.find(
        b =>
          b.status === 'CONFIRMED' &&
          b.fromDate &&
          new Date(b.fromDate).toDateString() === todayStr
      );
      const running = list.find(b => b.status === 'ONGOING');

      if (running) {
        setActiveTrip({
          id: running.id || running._id,
          bookingNumber: running.bookingNumber,
          status: 'ONGOING',
          flowStatus: running.flowStatus,
          startedAt: running.startedAt || new Date().toISOString(),
          customerName:
            (running.customer && running.customer.name) || 'Customer',
          pickup: running.pickupAddress || 'Pickup location',
        });
        setActiveStatus('ONGOING');
      } else if (startable) {
        setActiveTrip({
          id: startable.id || startable._id,
          bookingNumber: startable.bookingNumber,
          status: 'CONFIRMED',
          flowStatus: startable.flowStatus,
          fromDate: startable.fromDate,
          customerName:
            (startable.customer && startable.customer.name) || 'Customer',
          pickup: startable.pickupAddress || 'Pickup location',
          startTime: startable.startTime || '',
        });
        setActiveStatus('CONFIRMED');
      } else {
        // Check whether the currently displayed trip is still active; else clear.
        setActiveTrip(prev => {
          if (!prev) return prev;
          const still = list.some(
            b =>
              (b.id || b._id) === prev.id &&
              (b.status === 'ONGOING' || b.status === 'CONFIRMED')
          );
          if (!still) return null;
          return prev;
        });
        if (activeTrip) {
          const still = list.some(
            b =>
              (b.id || b._id) === activeTrip.id &&
              (b.status === 'ONGOING' || b.status === 'CONFIRMED')
          );
          if (!still) setActiveStatus('');
        }
      }
    } catch (err) {
      console.log('ACTION UPCOMING ERR:', err.response?.data || err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = React.useCallback(async () => {
    try {
      const res = await getActionDriverHistory();
      const list = (res.data?.bookings || [])
        .filter(b => {
          const s = String(b.status || b.bookingStatus || '').toUpperCase();
          return ['COMPLETED', 'CANCELLED', 'CANCELLED'].includes(s);
        })
        .map(b => {
          const customer = b.customer || {};
          const cancelled = ['CANCELLED', 'Cancelled'].includes(b.status);
          const cancelledByMe =
            cancelled &&
            (b.cancelledBy === 'Driver' || b.flowStatus === 'DRIVER_CANCELLED');
          const cancelledByCustomer =
            cancelled &&
            !cancelledByMe &&
            (b.cancelledBy === 'Customer' ||
              b.cancelledBy === 'System' ||
              b.flowStatus === 'CUSTOMER_CANCELLED' ||
              b.flowStatus === 'SYSTEM_CANCELLED' ||
              b.flowStatus === 'NO_SHOW');
          const isComplete = String(b.status).toUpperCase() === 'COMPLETED';
          const d = b.fromDate
            ? new Date(b.fromDate).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })
            : isComplete
              ? new Date(b.completedAt || b.createdBookingAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              : '';
          return {
            id: b.id || b._id,
            bookingNumber: b.bookingNumber,
            status: b.status,
            flowStatus: b.flowStatus,
            cancelledBy: b.cancelledBy,
            cancelReason: b.cancelReason,
            cancelledAt: b.cancelledAt,
            completedAt: b.completedAt,
            category: cancelledByMe
              ? 'byMe'
              : cancelledByCustomer || cancelled
                ? 'byCustomer'
                : isComplete
                  ? 'completed'
                  : 'other',
            user: customer.name || 'Customer',
            avatar: (customer.name || 'C').substring(0, 2).toUpperCase(),
            price: isComplete
              ? `₹${b.actualFare || b.amount || 0}`
              : `₹${b.amount || 0}`,
            pickup: b.pickupAddress || 'Pickup location',
            drop: b.dropAddress || 'Drop location',
            distance: `${d} • ${b.startTime || ''}–${b.endTime || ''}`,
            amount: b.amount || 0,
            actualFare: b.actualFare || 0,
            driverEarning: b.driverEarning || 0,
          };
        });
      setHistoryTrips(list);
    } catch (err) {
      console.log('HISTORY ERR:', err.response?.data || err);
    }
  }, []);

  const loadRequest = React.useCallback(async () => {
    try {
      // Acting driver flow: customer picked this driver for an hourly booking
      const actionRes = await getPendingBookingRequests();
      const actionRequests = actionRes.data?.requests || [];

      if (actionRequests.length > 0) {
        const r = actionRequests[0];
        const customer = r.customer || {};
        setTripRequest({
          id: r.requestId,
          requestId: r.requestId,
          source: 'action',
          bookingNumber: r.bookingNumber,
          user: customer.name || 'Customer',
          avatar: (customer.name || 'C').substring(0, 2).toUpperCase(),
          rating: '4.8',
          trips: 0,
          price: `₹${r.estimatedAmount || 0}`,
          pickup: r.pickupAddress || 'Pickup location',
          drop: r.dropAddress || 'Drop location',
          longTrip: (r.estimatedDurationHours || 0) > 6,
          distance: `${
            r.fromDate ? new Date(r.fromDate).toLocaleDateString() : ''
          } • ${r.startTime || ''}–${r.endTime || ''} • ${
            r.estimatedDurationHours || 0
          } hrs`,
          time: 'Now',
          estimatedFare: r.estimatedAmount || 0,
        });
        setLoading(false);
        return;
      }

      // New flow: customer-driver request (direct driver booking)
      const driverReqRes = await getPendingDriverRequests();
      const driverRequest = driverReqRes.data?.request;

      if (driverRequest) {
        const customer = driverRequest.customerId || {};
        setTripRequest({
          id: driverRequest._id,
          source: 'driverRequest',
          user: customer.fullName || customer.name || 'Customer',
          avatar: (customer.fullName || customer.name || 'C').substring(0, 2).toUpperCase(),
          rating: '4.8',
          trips: 0,
          price: `₹${driverRequest.estimatedFare || 0}`,
          pickup: driverRequest.pickupAddress || 'Pickup location',
          drop: driverRequest.dropAddress || 'Drop location',
          longTrip: false,
          distance: `Estimated fare: ₹${driverRequest.estimatedFare || 0}`,
          time: 'Now',
          estimatedFare: driverRequest.estimatedFare || 0,
        });
        setLoading(false);
        return;
      }

      // Fallback: legacy dispatch request
      const res = await getCurrentRequest();
      const booking = res.data.booking;

      if (booking) {
        const customer = booking.customerId || {};
        setTripRequest({
          id: booking._id,
          source: 'booking',
          bookingNumber: booking.bookingNumber,
          user: customer.fullName || 'Customer',
          avatar: (customer.fullName || 'C').substring(0, 2).toUpperCase(),
          rating: '4.8',
          trips: 0,
          price: `₹${booking.estimatedFare || 0}`,
          pickup: booking.pickupAddress || 'Pickup location',
          drop: booking.dropAddress || 'Drop location',
          longTrip: (booking.estimatedDistance || 0) > 50,
          distance: `${booking.estimatedDistance || 0} km • ~${booking.estimatedDuration || 0} min`,
          time: 'Now',
          estimatedFare: booking.estimatedFare || 0,
        });
      } else {
        setTripRequest(null);
      }
    } catch (err) {
      console.log('TRIP REQUEST ERR:', err.response?.data || err);
      setTripRequest(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRequest();
    loadUpcoming();
    loadActionUpcoming();
    loadHistory();
    const t = setInterval(() => {
      loadRequest();
      loadUpcoming();
      loadActionUpcoming();
      loadHistory();
    }, 5000);
    const e = setInterval(tickElapsed, 1000);
    return () => {
      clearInterval(t);
      clearInterval(e);
    };
  }, [loadRequest, loadUpcoming, loadActionUpcoming, loadHistory, tickElapsed]);

  const handleAccept = async () => {
    if (!tripRequest) return;
    try {
      if (tripRequest.source === 'driverRequest') {
        const res = await acceptDriverRequest(tripRequest.id);
        const newBooking = res.data?.booking;
        const bookingNumber = newBooking?.bookingNumber || tripRequest.id;
        const bookingId = newBooking?._id || newBooking?.id || tripRequest.id;
        setTripRequest(null);
        setShowSkipLimitMsg(false);
        await loadUpcoming();
        await loadHistory();
        Alert.alert('Request Accepted', 'Booking accepted. Contact the customer.');
        navigation.navigate('TripOtp', {
          bookingId,
          bookingNumber,
          purpose: 'start',
          source: 'driverRequest',
        });
      } else if (tripRequest.source === 'action') {
        await acceptBookingRequest(tripRequest.requestId);
        setTripRequest(null);
        setShowSkipLimitMsg(false);
        await loadUpcoming();
        await loadActionUpcoming();
        Alert.alert(
          'Booking Accepted',
          'Proceed to pickup on the scheduled date. Start the trip from the Active Trip card on the trip date.'
        );
      } else {
        await acceptBooking(tripRequest.bookingNumber);
        setTripRequest(null);
        setShowSkipLimitMsg(false);
        await loadUpcoming();
        await loadHistory();
        Alert.alert('Trip Accepted', 'Proceed to pickup location.');
        navigation.navigate('TripOtp', {
          bookingId: tripRequest.id,
          bookingNumber: tripRequest.bookingNumber,
          purpose: 'start',
        });
      }
    } catch (err) {
      console.log('ACCEPT ERR:', err.response?.data || err);
      Alert.alert('Error', err.response?.data?.message || 'Could not accept request');
      setTripRequest(null);
    }
  };

  const handleSkip = async () => {
    if (!tripRequest) return;
    setShowSkipLimitMsg(false);
    try {
      if (tripRequest.source === 'driverRequest') {
        await rejectDriverRequest(tripRequest.id);
      } else if (tripRequest.source === 'action') {
        await rejectBookingRequest(tripRequest.requestId);
      } else {
        await rejectBooking(tripRequest.bookingNumber);
      }
      setTripRequest(null);
      loadRequest();
    } catch (err) {
      console.log('SKIP ERR:', err.response?.data || err);
      const msg =
        err.response?.data?.message || err.message || 'Something went wrong.';
      if (err.response?.data?.code === 'CANCELLATION_LIMIT_REACHED' || msg.includes('CANCELLATION_LIMIT')) {
        setShowSkipLimitMsg(true);
      } else {
        Alert.alert('Cannot Skip', msg);
      }
    }
  };

  const handleStartTrip = () => {
    if (!activeTrip) return;
    navigation.navigate('TripOtp', {
      bookingId: activeTrip.id,
      bookingNumber: activeTrip.bookingNumber,
      purpose: 'start',
    });
  };

  const handleEndTrip = () => {
    if (!activeTrip) return;
    navigation.navigate('TripOtp', {
      bookingId: activeTrip.id,
      bookingNumber: activeTrip.bookingNumber,
      purpose: 'end',
    });
  };

  const handleCancelTrip = () => {
    if (!activeTrip || actionBusy) return;
    setPendingCancelTrip(activeTrip);
    setCancelModal(true);
  };

  const handleCancelUpcoming = trip => {
    if (actionBusy) return;
    setPendingCancelTrip(trip);
    setCancelModal(true);
  };

  const closeCancelModal = () => {
    setCancelModal(false);
    setPendingCancelTrip(null);
    setCancelReason(null);
    setCancelDesc('');
  };

  const confirmCancelTrip = () => {
    const target = pendingCancelTrip;
    if (!target) return;
    if (!cancelReason) {
      Alert.alert('Select a reason', 'Please choose a reason for cancelling this booking.');
      return;
    }
    const reason = cancelDesc && cancelDesc.trim()
      ? `${cancelReason.label} — ${cancelDesc.trim()}`
      : cancelReason.label;
    Alert.alert(
      'Cancel Trip',
      `Cancelling booking ${target.bookingNumber || ''} will search for a replacement driver for the customer. You will no longer be assigned. Continue?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel Trip',
          style: 'destructive',
          onPress: async () => {
            closeCancelModal();
            setActionBusy(true);
            try {
              await cancelActionTrip(target.id, reason);
              Alert.alert(
                'Cancelled',
                'We are searching for a replacement driver for the customer.'
              );
              if (activeTrip && activeTrip.id === target.id) {
                setActiveTrip(null);
                setActiveStatus('');
              }
              setUpcomingTrips(prev =>
                prev.filter(t => (t.id || t.bookingNumber) !== (target.id || target.bookingNumber))
              );
              await loadActionUpcoming();
              await loadUpcoming();
              await loadHistory();
            } catch (err) {
              console.log('CANCEL TRIP ERR:', err.response?.data || err);
              Alert.alert('Cannot Cancel', err.response?.data?.message || err.message || 'Something went wrong.');
              setActionBusy(false);
            }
          },
        },
      ]
    );
  };

  const handleEnRoute = async () => {
    if (!activeTrip || actionBusy) return;
    setActionBusy(true);
    try {
      await markActionEnRoute(activeTrip.id);
      setActiveTrip(prev => (prev ? { ...prev, flowStatus: 'DRIVER_EN_ROUTE' } : prev));
      Alert.alert('On My Way', 'The customer can now see you heading to the pickup.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not mark en route');
    } finally {
      setActionBusy(false);
    }
  };

  const handleArrived = async () => {
    if (!activeTrip || actionBusy) return;
    setActionBusy(true);
    try {
      await markActionArrived(activeTrip.id);
      setActiveTrip(prev => (prev ? { ...prev, flowStatus: 'DRIVER_ARRIVED' } : prev));
      Alert.alert('Arrived', 'Marked as arrived. The customer no-show window has started.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Could not mark arrived');
    } finally {
      setActionBusy(false);
    }
  };

  const closeUnavailableModal = () => {
    setUnavailableModal(false);
    setUnavailableReason(null);
    setUnavailableDesc('');
  };

  const confirmUnavailable = () => {
    if (!unavailableReason) {
      Alert.alert('Select a reason', 'Please choose why you cannot complete this booking.');
      return;
    }
    Alert.alert(
      'Unable to Complete Booking',
      'This frees your schedule and we will search for a replacement driver. Continue?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Report',
          style: 'destructive',
          onPress: async () => {
            const bookingId = activeTrip ? activeTrip.id : null;
            const reason = unavailableReason;
            const description = unavailableDesc;
            closeUnavailableModal();
            if (!bookingId) return;
            setActionBusy(true);
            try {
              await unavailableActionBooking(bookingId, reason, description);
              setActiveTrip(null);
              setActiveStatus('');
              await loadActionUpcoming();
              Alert.alert('Reported', 'A replacement driver will be assigned to the customer.');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Could not report unavailability');
            } finally {
              setActionBusy(false);
            }
          },
        },
      ]
    );
  };

  const formatElapsed = s => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  };

  const completedTrips = historyTrips.filter(t => t.category === 'completed');
  const cancelledByCustomer = historyTrips.filter(t => t.category === 'byCustomer');
  const cancelledByMe = historyTrips.filter(t => t.category === 'byMe');

  const renderHistoryCard = trip => (
    <View key={trip.id || trip.bookingNumber} style={styles.historyCard}>
      <View style={styles.userRow}>
        <Avatar name={trip.user} size={40} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.userName}>{trip.user}</Text>
          <Text style={styles.historyBooking}>#{trip.bookingNumber}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.priceSmall}>{trip.price}</Text>
          {trip.category === 'completed' ? (
            <Pill color={C.success} bg={C.successSoft} icon="check-circle">
              Completed
            </Pill>
          ) : (
            <Pill color={C.danger} bg={C.dangerSoft} icon="cancel">
              Cancelled
            </Pill>
          )}
        </View>
      </View>

      <View style={styles.upcomingRoute}>
        <View style={styles.routeStop}>
          <View style={[styles.routeDot, { backgroundColor: C.success }]} />
          <Text style={styles.upcomingText} numberOfLines={1}>
            {trip.pickup}
          </Text>
        </View>
        <View style={styles.routeStop}>
          <View style={[styles.routeDot, styles.routeDotRed]} />
          <Text style={styles.upcomingText} numberOfLines={1}>
            {trip.drop}
          </Text>
        </View>
      </View>

      {trip.category !== 'completed' && (
        <View style={styles.reasonBox}>
          <MaterialIcons name="info" size={15} color={C.danger} />
          <Text style={styles.reasonText}>
            {trip.cancelReason || 'No reason provided'}
          </Text>
        </View>
      )}

      <View style={styles.upcomingFoot}>
        <Pill icon="schedule">{trip.distance}</Pill>
        <Text style={styles.upcomingTime}>
          {trip.category === 'completed'
            ? `Completed ${new Date(trip.completedAt || trip.cancelledAt || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}`
            : `On ${new Date(trip.cancelledAt || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}`}
        </Text>
      </View>
    </View>
  );

  const renderRequestCard = () => (
    <View style={styles.reqCard}>
      <View style={styles.reqCardTop}>
        <Pill color={C.accent} bg={C.accentSoft} icon="bolt">
          New request
        </Pill>
        <Text style={styles.reqNow}>{tripRequest.time}</Text>
      </View>

      {/* User */}
      <View style={styles.userRow}>
        <Avatar name={tripRequest.user || 'Customer'} size={50} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.userName}>{tripRequest.user}</Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={14} color={C.warning} />
            <Text style={styles.ratingText}>
              {tripRequest.rating} • {tripRequest.trips} trips
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.price}>{tripRequest.price}</Text>
          <Text style={styles.estimate}>estimated</Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeLine}>
        <View style={[styles.routeDot, { backgroundColor: C.success }]} />
        <View style={styles.routeBar} />
        <View style={[styles.routeDot, styles.routeDotRed]} />
      </View>
      <View style={styles.routeTexts}>
        <View style={styles.routeStop}>
          <Text style={styles.routeStopText}>{tripRequest.pickup}</Text>
          <Text style={styles.routeStopTag}>PICKUP</Text>
        </View>
        <View style={styles.routeStop}>
          <Text style={styles.routeStopText}>{tripRequest.drop}</Text>
          <Text style={[styles.routeStopTag, { color: C.danger }]}>DROP</Text>
        </View>
      </View>

      <LongTripTag value={tripRequest.distance} />

      {showSkipLimitMsg && (
        <Text style={styles.skipLimitMsg}>
          You have reached the skip/cancellation limit. Please accept this trip
          to continue. The limit resets automatically after the restriction
          period.
        </Text>
      )}

      {/* Actions */}
      <View style={styles.buttonRow}>
        <PrimaryButton
          title="Accept Trip"
          icon="check"
          onPress={handleAccept}
          style={{ flex: 1, marginRight: 10, backgroundColor: C.success }}
        />
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <MaterialIcons name="close" size={24} color={C.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Trips</Text>
            <Text style={styles.subtitle}>Pickups, dropoffs & requests</Text>
          </View>
          <View style={styles.notification}>
            <View style={styles.notificationCircle}>
              <MaterialIcons name="notifications" size={20} color={C.primary} />
            </View>
          </View>
        </View>

        {/* Loading */}
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 50 }} size="large" />
        ) : (
          <>
            {/* New request */}
            {tripRequest ? (
              <View style={styles.section}>{renderRequestCard()}</View>
            ) : (
              <View style={[styles.section, styles.emptyState]}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="event-available" size={36} color={C.primary} />
                </View>
                <Text style={styles.emptyText}>No upcoming trip requests</Text>
                <Text style={styles.emptySubText}>
                  New requests will appear here instantly
                </Text>
              </View>
            )}

            {/* Active trip */}
            {activeTrip && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {activeStatus === 'ONGOING' ? 'Active trip' : "Today's trip"}
                </Text>
                <View style={styles.activeCard}>
                  <View style={styles.activeCardGlow} />
                  <View style={styles.activeHeader}>
                    <Pill color="#FFD9BC" bg="rgba(255,255,255,0.14)" icon={activeStatus === 'ONGOING' ? 'timer' : 'event'}>
                      {activeStatus === 'ONGOING' ? 'LIVE' : 'TODAY'}
                    </Pill>
                    <Text style={styles.activeBooking}>{activeTrip.bookingNumber}</Text>
                  </View>

                  <Text style={styles.activeName}>{activeTrip.customerName}</Text>
                  <View style={styles.activePickupRow}>
                    <MaterialIcons name="place" size={15} color="#FFD9BC" />
                    <Text style={styles.activePickup}>{activeTrip.pickup}</Text>
                  </View>
                  {activeStatus === 'CONFIRMED' && activeTrip.startTime ? (
                    <Text style={styles.activePickup}>
                      Scheduled at {activeTrip.startTime}
                    </Text>
                  ) : null}

                  {activeStatus === 'ONGOING' ? (
                    <>
                      <View style={styles.timerBox}>
                        <MaterialIcons name="timer" size={18} color="#FFD9BC" />
                        <Text style={styles.timerText}>{formatElapsed(elapsed)}</Text>
                        <View style={styles.timerPulse} />
                      </View>
                      <TouchableOpacity style={styles.activeBtn} onPress={handleEndTrip} activeOpacity={0.88}>
                        <Text style={styles.activeBtnText}>
                          End Trip{' '}
                          <MaterialIcons name="flag" size={16} color="#fff" style={{ top: 2 }} />
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {activeTrip.flowStatus === 'DRIVER_EN_ROUTE' && (
                        <View style={styles.enRouteNote}>
                          <MaterialIcons name="navigation" size={16} color="#FFD9BC" />
                          <Text style={styles.enRouteNoteText}>On my way to the pickup</Text>
                        </View>
                      )}
                      {activeTrip.flowStatus === 'DRIVER_ARRIVED' && (
                        <View style={styles.enRouteNote}>
                          <MaterialIcons name="place" size={16} color={C.success} />
                          <Text style={styles.enRouteNoteText}>
                            You've arrived — waiting for the customer
                          </Text>
                        </View>
                      )}
                      {!['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED'].includes(
                        activeTrip.flowStatus
                      ) && (
                        <TouchableOpacity
                          style={styles.outlineBtn}
                          onPress={handleEnRoute}
                          activeOpacity={0.88}
                          disabled={actionBusy}
                        >
                          <Text style={styles.outlineBtnText}>
                            On My Way{' '}
                            <MaterialIcons name="navigation" size={16} color="#FFD9BC" style={{ top: 2 }} />
                          </Text>
                        </TouchableOpacity>
                      )}
                      {activeTrip.flowStatus !== 'DRIVER_ARRIVED' && (
                        <TouchableOpacity
                          style={styles.activeBtn}
                          onPress={handleArrived}
                          activeOpacity={0.88}
                          disabled={actionBusy}
                        >
                          <Text style={styles.activeBtnText}>
                            I've Arrived{' '}
                            <MaterialIcons name="place" size={16} color="#fff" style={{ top: 2 }} />
                          </Text>
                        </TouchableOpacity>
                      )}
                      {!['DRIVER_EN_ROUTE', 'DRIVER_ARRIVED'].includes(
                        activeTrip.flowStatus
                      ) && (
                        <TouchableOpacity
                          style={styles.unavailableBtn}
                          onPress={() => setUnavailableModal(true)}
                          disabled={actionBusy}
                        >
                          <Text style={styles.unavailableBtnText}>Unable to Complete Booking</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={handleCancelTrip}
                        activeOpacity={0.88}
                        disabled={actionBusy}
                      >
                        <Text style={styles.cancelBtnText}>
                          <MaterialIcons name="close" size={16} color="#FF8A8A" style={{ top: 2 }} /> Cancel Trip
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={handleStartTrip}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.startBtnText}>
                          Start Trip{' '}
                          <MaterialIcons name="directions-car" size={16} color={C.accent} style={{ top: 2 }} />
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Upcoming */}
            {upcomingTrips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming trips</Text>
                {upcomingTrips.map((trip, idx) => (
                  <View
                    key={`${trip.source}-${trip.id || trip.bookingNumber}`}
                    style={styles.upcomingCard}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        if (trip.source === 'actionSchedule') {
                          Alert.alert(
                            'Scheduled Trip',
                            'This trip starts on the scheduled date. It will appear under Active Trip then.'
                          );
                        } else {
                          navigation.navigate('TripOtp', {
                            bookingId: trip.id,
                            bookingNumber: trip.bookingNumber,
                            purpose: 'start',
                          });
                        }
                      }}
                    >
                      <View style={styles.userRow}>
                        <Avatar name={trip.user} size={46} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.userName}>{trip.user}</Text>
                          <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={13} color={C.warning} />
                            <Text style={styles.ratingText}>
                              {trip.rating} • {trip.trips} trips
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.priceSmall}>{trip.price}</Text>
                          <Text style={styles.estimate}>estimated</Text>
                        </View>
                      </View>

                      <View style={styles.upcomingRoute}>
                        <View style={styles.routeStop}>
                          <View style={[styles.routeDot, { backgroundColor: C.success }]} />
                          <Text style={styles.upcomingText} numberOfLines={1}>
                            {trip.pickup}
                          </Text>
                        </View>
                        <View style={styles.routeStop}>
                          <View style={[styles.routeDot, styles.routeDotRed]} />
                          <Text style={styles.upcomingText} numberOfLines={1}>
                            {trip.drop}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.upcomingFoot}>
                      <Pill icon={trip.source === 'actionSchedule' ? 'event' : 'schedule'}>
                        {trip.distance}
                      </Pill>
                      <Text style={styles.upcomingTime}>Accepted {trip.acceptedAt}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.cancelSmallBtn}
                      onPress={() => handleCancelUpcoming(trip)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons name="close" size={14} color="#FF8A8A" />
                      <Text style={styles.cancelSmallBtnText}>Cancel this trip</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Completed trips */}
            {completedTrips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Completed trips ({completedTrips.length})
                </Text>
                {completedTrips.map(renderHistoryCard)}
              </View>
            )}

            {/* Cancelled by the customer */}
            {cancelledByCustomer.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Cancelled by customer ({cancelledByCustomer.length})
                </Text>
                {cancelledByCustomer.map(renderHistoryCard)}
              </View>
            )}

            {/* Cancelled by me (driver) */}
            {cancelledByMe.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Cancelled by me ({cancelledByMe.length})
                </Text>
                {cancelledByMe.map(renderHistoryCard)}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={unavailableModal}
        transparent
        animationType="fade"
        onRequestClose={closeUnavailableModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Unable to Complete Booking</Text>
            <Text style={styles.modalSubtitle}>
              Tell us why — we'll search for a replacement for the customer.
            </Text>

            {UNAVAILABILITY_REASONS.map(r => (
              <TouchableOpacity
                key={r.key}
                style={[
                  styles.reasonRow,
                  unavailableReason === r.key && styles.reasonRowSelected,
                ]}
                onPress={() => setUnavailableReason(r.key)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={
                    unavailableReason === r.key
                      ? 'radio-button-checked'
                      : 'radio-button-unchecked'
                  }
                  size={18}
                  color={unavailableReason === r.key ? C.accent : C.textMuted}
                />
                <Text
                  style={[
                    styles.reasonText,
                    unavailableReason === r.key && styles.reasonTextSelected,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={styles.modalInput}
              placeholder="Add a note (optional)"
              placeholderTextColor={C.textMuted}
              value={unavailableDesc}
              onChangeText={setUnavailableDesc}
              multiline
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={closeUnavailableModal}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: C.textSub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={confirmUnavailable}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Trip modal */}
      <Modal
        visible={cancelModal}
        transparent
        animationType="fade"
        onRequestClose={closeCancelModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancel Trip</Text>
            <Text style={styles.modalSubtitle}>
              This will search for a replacement driver for the customer. You will no longer be
              assigned. Please select a reason.
            </Text>

            {CANCEL_REASONS.map(r => (
              <TouchableOpacity
                key={r.key}
                style={[
                  styles.reasonRow,
                  cancelReason === r.key && styles.reasonRowSelected,
                ]}
                onPress={() => setCancelReason(r.key)}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={
                    cancelReason === r.key
                      ? 'radio-button-checked'
                      : 'radio-button-unchecked'
                  }
                  size={18}
                  color={cancelReason === r.key ? C.accent : C.textMuted}
                />
                <Text
                  style={[
                    styles.reasonText,
                    cancelReason === r.key && styles.reasonTextSelected,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TextInput
              style={styles.modalInput}
              placeholder="Add a note (optional)"
              placeholderTextColor={C.textMuted}
              value={cancelDesc}
              onChangeText={setCancelDesc}
              multiline
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={closeCancelModal}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalBtnText, { color: C.textSub }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={confirmCancelTrip}
                activeOpacity={0.85}
              >
                <Text style={styles.modalBtnText}>Cancel Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TripScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 6,
  },
  title: {
    color: C.text,
    fontSize: 27,
    fontWeight: 'bold',
  },
  subtitle: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 1,
  },
  notification: {
    position: 'relative',
    marginRight: 2,
  },
  notificationCircle: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    color: C.primary,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 10,
  },

  /* ================= REQUEST CARD ================= */
  reqCard: {
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    padding: 18,
    ...C.shadow,
    shadowOpacity: 0.1,
  },
  reqCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reqNow: {
    color: C.textSub,
    fontSize: 12,
    fontWeight: '600',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    color: C.textSub,
    fontSize: 13,
    marginLeft: 4,
  },
  price: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'right',
  },
  priceSmall: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'right',
  },
  estimate: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },

  /* route visual */
  routeLine: {
    alignItems: 'center',
    marginTop: 16,
  },
  routeBar: {
    width: 2,
    height: 20,
    backgroundColor: C.borderDark,
    marginVertical: 2,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.success,
    borderWidth: 2,
    borderColor: C.successSoft,
  },
  routeDotRed: {
    backgroundColor: C.danger,
    borderColor: C.dangerSoft,
  },
  routeTexts: {
    marginTop: 4,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  routeStopText: {
    color: C.text,
    fontSize: 14,
    flexShrink: 1,
  },
  routeStopTag: {
    color: C.success,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 8,
  },

  skipLimitMsg: {
    color: C.danger,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  rejectBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.dangerSoft,
    borderWidth: 1.5,
    borderColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ================= EMPTY ================= */
  emptyState: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 36,
    ...C.shadow,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyText: {
    color: C.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: C.textMuted,
    marginTop: 4,
    fontSize: 13,
  },

  /* ================= ACTIVE TRIP ================= */
  activeCard: {
    backgroundColor: C.primary,
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
    ...C.shadow,
    shadowOpacity: 0.3,
  },
  activeCardGlow: {
    position: 'absolute',
    top: -55,
    right: -55,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,106,0,0.3)',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeBooking: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 10,
  },
  activeName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 19,
    marginTop: 12,
  },
  activePickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  activePickup: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginLeft: 6,
    marginTop: 4,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  timerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    marginLeft: 10,
    letterSpacing: 2,
  },
  timerPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
    marginLeft: 'auto',
  },
  activeBtn: {
    backgroundColor: C.accent,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 14,
    ...C.shadow,
    shadowOpacity: 0.3,
    shadowColor: '#000',
  },
  activeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#FFD9BC',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 14,
  },
  outlineBtnText: {
    color: '#FFD9BC',
    fontWeight: 'bold',
    fontSize: 15,
  },
  startBtn: {
    borderWidth: 1.5,
    borderColor: C.accent,
    backgroundColor: 'rgba(255,106,0,0.12)',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  startBtnText: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 15,
  },
  unavailableBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.7)',
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 12,
  },
  unavailableBtnText: {
    color: '#FF8888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    borderWidth: 1.8,
    borderColor: '#FF6B6B',
    backgroundColor: 'rgba(255,50,50,0.12)',
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: {
    color: '#FF8A8A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  unavailableBtnText: {
    color: '#FF8888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  enRouteNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  enRouteNoteText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginLeft: 8,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    ...C.shadow,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 4,
  },
  reasonRowSelected: {
    backgroundColor: C.accentSoft,
  },
  reasonText: {
    color: C.text,
    fontSize: 14,
    marginLeft: 10,
  },
  reasonTextSelected: {
    color: C.accent,
    fontWeight: 'bold',
  },
  modalInput: {
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: C.text,
    marginTop: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 30,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 10,
  },
  modalBtnCancel: {
    backgroundColor: C.inputBg,
    marginLeft: 0,
    marginRight: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  /* ================= UPCOMING ================= */
  upcomingCard: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    marginBottom: 12,
    ...C.shadow,
  },
  upcomingRoute: {
    marginTop: 6,
    paddingLeft: 2,
  },
  upcomingText: {
    color: C.textSub,
    fontSize: 13,
    flexShrink: 1,
    marginLeft: 8,
  },
  upcomingFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  upcomingTime: {
    color: C.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },

  cancelSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(239,68,68,0.6)',
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255,50,50,0.08)',
  },
  cancelSmallBtnText: {
    color: '#FF8A8A',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 5,
  },

  /* ================= HISTORY ================= */
  historyCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
    ...C.shadow,
    shadowOpacity: 0.08,
  },
  historyBooking: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.dangerSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  reasonText: {
    flex: 1,
    color: C.text,
    fontSize: 12,
    marginLeft: 6,
  },
});