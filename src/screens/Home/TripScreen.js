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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../../api';
import {
  getCurrentRequest,
  getPendingDriverRequests,
  getUpcomingTrips,
  acceptBooking,
  rejectBooking,
  acceptDriverRequest,
  rejectDriverRequest,
} from '../../api';
import { C } from '../../theme';

const TripScreen = () => {
  const navigation = useNavigation();
  const [tripRequest, setTripRequest] = React.useState(null);
  const [upcomingTrips, setUpcomingTrips] = React.useState([]);
  const [skipCount, setSkipCount] = React.useState(0);
  const [showSkipLimitMsg, setShowSkipLimitMsg] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadUpcoming = React.useCallback(async () => {
    try {
      const res = await getUpcomingTrips();
      const list = (res.data?.bookings || []).map((b) => {
        const customer = b.customerId || {};
        return {
          id: b._id,
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
      setUpcomingTrips(list);
    } catch (err) {
      console.log('UPCOMING ERR:', err.response?.data || err);
    }
  }, []);

  const loadRequest = React.useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) setAuthToken(token);

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
    const t = setInterval(() => {
      loadRequest();
      loadUpcoming();
    }, 5000);
    return () => clearInterval(t);
  }, [loadRequest, loadUpcoming]);

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

  const LongTripTag = ({ value }) => (
    <View style={styles.longTrip}>
      <Text style={styles.longTripText}>Long Trip</Text>
      <Text style={styles.distance}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Trip Requests</Text>
        <View style={styles.notification}>
          <View style={styles.notificationCircle}>
            <MaterialIcons name="notifications" size={20} color={C.primary} />
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </View>
      </View>

      {/* Trip Card */}
      <View style={styles.cardWrapper}>
        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : tripRequest ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.newRequest}>NEW REQUEST</Text>
              <Text style={styles.time}>{tripRequest.time}</Text>
            </View>

            {/* User Info */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{tripRequest.avatar}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{tripRequest.user}</Text>
                <Text style={styles.rating}>{tripRequest.rating} ⭐ • {tripRequest.trips} trips</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>{tripRequest.price}</Text>
                <Text style={styles.estimate}>estimated</Text>
              </View>
            </View>

            {/* Pickup / Drop */}
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: C.success }]} />
              <Text style={styles.locationText}>{tripRequest.pickup}</Text>
            </View>
            <View style={styles.locationRow}>
              <View style={[styles.dot, { backgroundColor: C.danger }]} />
              <Text style={styles.locationText}>{tripRequest.drop}</Text>
            </View>

            <LongTripTag value={tripRequest.distance} />

            {showSkipLimitMsg && (
              <Text style={styles.skipLimitMsg}>
                You have reached the skip limit. Please accept this trip to continue.
              </Text>
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptText}>Accept Trip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rejectBtn, showSkipLimitMsg && { opacity: 0.5 }]}
                onPress={handleSkip}
                disabled={showSkipLimitMsg}
              >
                <MaterialIcons name="close" size={22} color={C.danger} />
              </TouchableOpacity>
            </View>

            {!showSkipLimitMsg && skipCount > 0 && (
              <Text style={styles.skipInfo}>Skips left: {2 - skipCount}</Text>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="event-available" size={36} color={C.primary} />
            </View>
            <Text style={styles.emptyText}>No upcoming trip requests</Text>
            <Text style={styles.emptySubText}>New requests will appear here instantly</Text>
          </View>
        )}
      </View>

      {/* Upcoming Trips Section */}
      {upcomingTrips.length > 0 && (
        <View style={styles.upcomingWrapper}>
          <Text style={styles.upcomingTitle}>Upcoming Trips</Text>
          {upcomingTrips.map((trip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.upcomingCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('TripOtp', { bookingNumber: trip.bookingNumber })}
            >
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{trip.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{trip.user}</Text>
                  <Text style={styles.rating}>{trip.rating} ⭐ • {trip.trips} trips</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.price}>{trip.price}</Text>
                  <Text style={styles.estimate}>estimated</Text>
                </View>
              </View>
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: C.success }]} />
                <Text style={styles.locationText}>{trip.pickup}</Text>
              </View>
              <View style={styles.locationRow}>
                <View style={[styles.dot, { backgroundColor: C.danger }]} />
                <Text style={styles.locationText}>{trip.drop}</Text>
              </View>
              <LongTripTag value={trip.distance} />
              <Text style={styles.upcomingTime}>Accepted at {trip.acceptedAt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  upcomingWrapper: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  upcomingTitle: {
    color: C.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: 1,
  },
  upcomingCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.accentBorder,
    padding: 14,
    marginBottom: 10,
    ...C.shadow,
  },
  upcomingTime: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 0,
    paddingBottom: 80,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: 'bold',
  },
  notification: {
    position: 'relative',
    marginRight: 5,
  },
  notificationCircle: {
    backgroundColor: C.primarySoft,
    borderRadius: 20,
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: C.primary,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    flex: 1,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
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
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySubText: {
    color: C.textMuted,
    marginTop: 4,
    fontSize: 13,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    padding: 18,
    ...C.shadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newRequest: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  time: {
    color: C.textSub,
    fontSize: 13,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: C.primarySoft,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  avatarText: {
    color: C.primaryDark,
    fontWeight: 'bold',
    fontSize: 18,
  },
  name: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  rating: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'right',
  },
  estimate: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  locationText: {
    color: C.text,
    fontSize: 14,
    flexShrink: 1,
  },
  longTrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
    backgroundColor: C.accentSoft,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  longTripText: {
    color: C.accentDark,
    borderRadius: 8,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 13,
  },
  distance: {
    color: C.textSub,
    fontSize: 13,
    flexShrink: 1,
  },
  skipLimitMsg: {
    color: C.danger,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: C.success,
    paddingVertical: 13,
    borderRadius: 30,
    alignItems: 'center',
    marginRight: 10,
    ...C.shadow,
    shadowOpacity: 0.25,
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  rejectBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.dangerSoft,
    borderWidth: 1,
    borderColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipInfo: {
    color: C.accent,
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
  },
});

export default TripScreen;