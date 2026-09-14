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
} from '../../api';
import { C } from '../../theme';
import { Avatar, Pill, PrimaryButton } from '../../components/ui';

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
  const [skipCount, setSkipCount] = React.useState(0);
  const [showSkipLimitMsg, setShowSkipLimitMsg] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

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
    const t = setInterval(() => {
      loadRequest();
      loadUpcoming();
      loadActionUpcoming();
    }, 5000);
    const e = setInterval(tickElapsed, 1000);
    return () => {
      clearInterval(t);
      clearInterval(e);
    };
  }, [loadRequest, loadUpcoming, loadActionUpcoming, tickElapsed]);

  const handleAccept = async () => {
    if (!tripRequest) return;
    try {
      if (tripRequest.source === 'driverRequest') {
        const res = await acceptDriverRequest(tripRequest.id);
        const newBooking = res.data?.booking;
        const bookingNumber = newBooking?.bookingNumber || tripRequest.id;
        setTripRequest(null);
        setSkipCount(0);
        setShowSkipLimitMsg(false);
        await loadUpcoming();
        Alert.alert('Request Accepted', 'Booking accepted. Contact the customer.');
        navigation.navigate('TripOtp', { bookingNumber, source: 'driverRequest' });
      } else if (tripRequest.source === 'action') {
        await acceptBookingRequest(tripRequest.requestId);
        setTripRequest(null);
        setSkipCount(0);
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
        setSkipCount(0);
        setShowSkipLimitMsg(false);
        await loadUpcoming();
        Alert.alert('Trip Accepted', 'Proceed to pickup location.');
        navigation.navigate('TripOtp', { bookingNumber: tripRequest.bookingNumber });
      }
    } catch (err) {
      console.log('ACCEPT ERR:', err.response?.data || err);
      Alert.alert('Error', err.response?.data?.message || 'Could not accept request');
      setTripRequest(null);
    }
  };

  const handleSkip = async () => {
    if (!tripRequest) return;
    if (skipCount < 2) {
      try {
        if (tripRequest.source === 'driverRequest') {
          await rejectDriverRequest(tripRequest.id);
        } else if (tripRequest.source === 'action') {
          await rejectBookingRequest(tripRequest.requestId);
        } else {
          await rejectBooking(tripRequest.bookingNumber);
        }
      } catch (err) {
        console.log('SKIP ERR:', err.response?.data || err);
      }
      setTripRequest(null);
      setSkipCount(skipCount + 1);
      setShowSkipLimitMsg(false);
      loadRequest();
    } else {
      setShowSkipLimitMsg(true);
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

  const formatElapsed = s => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(sec)}`;
  };

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
          You have reached the skip limit. Please accept this trip to continue.
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
          style={[styles.rejectBtn, showSkipLimitMsg && { opacity: 0.5 }]}
          onPress={handleSkip}
          disabled={showSkipLimitMsg}
          activeOpacity={0.8}
        >
          <MaterialIcons name="close" size={24} color={C.danger} />
        </TouchableOpacity>
      </View>

      {!showSkipLimitMsg && skipCount > 0 && (
        <Text style={styles.skipInfo}>
          You skipped this trip. Skips left: {2 - skipCount}
        </Text>
      )}
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
                    <TouchableOpacity style={styles.activeBtn} onPress={handleStartTrip} activeOpacity={0.88}>
                      <Text style={styles.activeBtnText}>
                        Start Trip{' '}
                        <MaterialIcons name="directions-car" size={16} color="#fff" style={{ top: 2 }} />
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Upcoming */}
            {upcomingTrips.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming trips</Text>
                {upcomingTrips.map((trip, idx) => (
                  <TouchableOpacity
                    key={`${trip.source}-${trip.id || trip.bookingNumber}`}
                    style={styles.upcomingCard}
                    activeOpacity={0.85}
                    onPress={() => {
                      if (trip.source === 'actionSchedule') {
                        Alert.alert(
                          'Scheduled Trip',
                          'This trip starts on the scheduled date. It will appear under Active Trip then.'
                        );
                      } else {
                        navigation.navigate('TripOtp', { bookingNumber: trip.bookingNumber });
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

                    <View style={styles.upcomingFoot}>
                      <Pill icon={trip.source === 'actionSchedule' ? 'event' : 'schedule'}>
                        {trip.distance}
                      </Pill>
                      <Text style={styles.upcomingTime}>Accepted {trip.acceptedAt}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
  skipInfo: {
    color: C.accent,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
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
});