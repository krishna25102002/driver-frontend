import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { setAuthToken } from '../../api';
import {
  getDriverProfile,
  getDashboard,
  getCurrentBooking,
  updateDriverStatus,
} from '../../api';
import { C } from '../../theme';

const Dashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) setAuthToken(token);

      const [p, d, b] = await Promise.all([
        getDriverProfile(),
        getDashboard(),
        getCurrentBooking(),
      ]);

      setProfile(p.data.driver || p.data);
      setDashboard(d.data.dashboard || d.data);
      setBooking(b.data.booking || null);

      if (p.data.driver?.accountStatus) {
        setIsOnline(p.data.driver.accountStatus === 'Online');
      }
    } catch (err) {
      console.log('DASHBOARD ERR:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggleStatus = async (value) => {
    setIsOnline(value);
    try {
      await updateDriverStatus(value ? 'Online' : 'Offline');
    } catch (err) {
      console.log('STATUS ERR:', err.response?.data || err);
      setIsOnline(!value);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.name}>{profile?.fullName || 'Driver'}</Text>
          <Text style={styles.location}>
            <Icon name="location-on" size={14} color={C.primary} /> {profile?.city ? `${profile.city}, ${profile.state || ''}` : 'Ready for trips'}
          </Text>

          <View style={styles.statusRow}>
            <View style={[styles.onlinePill, !isOnline && styles.offlinePill]}>
              <Text style={[styles.onlineText, !isOnline && styles.offlineText]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <Text style={styles.readyText}>
              {isOnline ? 'Ready for trips' : 'Not taking trips'}
            </Text>

            <Switch
              value={isOnline}
              onValueChange={toggleStatus}
              thumbColor="#fff"
              trackColor={{ false: C.borderDark, true: C.primary }}
            />
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapBox}>
        <Icon name="location-on" size={40} color={C.primary} />
        <Text style={styles.mapText}>Live location tracking</Text>
      </View>

      {/* Cards */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Earnings</Text>
          <Text style={styles.earnings}>₹{dashboard?.todayEarnings ?? '0'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trips Today</Text>
          <Text style={styles.trips}>{dashboard?.todayTrips ?? '0'}</Text>
        </View>
      </View>

      {/* Trip Request / Active Booking */}
      {booking ? (
        <View style={[styles.tripBox, styles.tripBoxActive]}>
          <View style={styles.tripHeader}>
            <View style={styles.tripTitleWrap}>
              <View style={styles.tripPulse} />
              <Text style={styles.tripTitle}>
                {booking.bookingStatus === 'Accepted'
                  ? 'Trip Accepted — Head to Pickup'
                  : booking.bookingStatus === 'Reached Pickup'
                    ? 'Reached Pickup'
                    : 'Trip In Progress'}
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>#{booking.bookingNumber}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: C.success }]} />
            <Text style={styles.tripRoute}>
              {booking.pickupLocation?.address || booking.pickupAddress}
            </Text>
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: C.danger }]} />
            <Text style={styles.tripRoute}>
              {booking.dropLocation?.address || booking.dropAddress}
            </Text>
          </View>
          <Text style={styles.tripFare}>Estimated Fare: ₹{booking.estimatedFare || booking.fare}</Text>
        </View>
      ) : (
        <View style={styles.tripBox}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>No Active Trip</Text>
          </View>
          <Text style={styles.tripRoute}>
            {isOnline ? 'Waiting for trip requests…' : 'Go online to receive trips'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 16,
    paddingBottom: 80,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  greeting: {
    color: C.textSub,
  },

  name: {
    color: C.text,
    fontSize: 24,
    fontWeight: 'bold',
  },

  location: {
    color: C.textSub,
    marginVertical: 5,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  onlinePill: {
    backgroundColor: C.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  onlineText: {
    color: C.success,
    fontWeight: 'bold',
    fontSize: 12,
  },
  offlinePill: {
    backgroundColor: C.inputBg,
  },
  offlineText: {
    color: C.textMuted,
  },

  readyText: {
    color: C.textMuted,
    marginRight: 10,
    fontSize: 12,
  },

  avatar: {
    backgroundColor: C.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...C.shadow,
    shadowOpacity: 0.3,
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },

  mapBox: {
    backgroundColor: C.surface,
    height: 130,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    marginVertical: 15,
  },

  mapText: {
    color: C.textMuted,
    marginTop: 6,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    backgroundColor: C.surface,
    width: '48%',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },

  cardTitle: {
    color: C.textSub,
  },

  earnings: {
    color: C.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },

  trips: {
    color: C.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },

  tripBox: {
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: C.border,
  },

  tripBoxActive: {
    backgroundColor: C.accentSoft,
    borderColor: C.accentBorder,
  },

  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tripTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  tripPulse: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.primary,
    marginRight: 8,
  },

  tripTitle: {
    color: C.accentDark,
    fontWeight: 'bold',
    flex: 1,
  },

  distanceBadge: {
    backgroundColor: C.accent,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },

  distanceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  tripRoute: {
    color: C.text,
    flexShrink: 1,
  },

  tripFare: {
    color: C.accent,
    fontWeight: 'bold',
    marginTop: 10,
  },
});