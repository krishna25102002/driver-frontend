import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getDriverProfile,
  getDashboard,
  getCurrentBooking,
  updateDriverStatus,
} from '../../api';
import { C } from '../../theme';
import { Avatar, Hero, Pill } from '../../components/ui';
import SkipCounterBanner from '../../components/SkipCounterBanner';
import usePendingTripRequest from '../../hooks/usePendingTripRequest';

const formatElapsed = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
};

const roundRupee = (n) => Math.round(n);

const liveBill = (seconds, perHourRate = 210) => {
  const mins = Math.max(1, Math.ceil(seconds / 60));
  const billableHours = Math.max(1, Math.ceil(mins / 30) / 2);
  const base = roundRupee(billableHours * perHourRate);
  const platform = roundRupee(Math.max(50, base * 0.15));
  const gst = roundRupee((base + platform) * 0.18);
  return {
    billableHours,
    base,
    platform,
    gst,
    total: base + platform + gst,
    perHourRate,
  };
};

const Pulse = ({ color = C.accent, size = 18 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1700,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            backgroundColor: color,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      <View
        style={{
          width: size / 2,
          height: size / 2,
          borderRadius: size / 4,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

const Dashboard = ({ onGoToTrips }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [booking, setBooking] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef(null);

  const { tripRequest } = usePendingTripRequest();

  useEffect(() => {
    startedAtRef.current = booking?.startedAt || null;
  }, [booking?.startedAt]);

  useEffect(() => {
    if (booking?.bookingStatus !== 'ONGOING' || !startedAtRef.current) return undefined;
    const tick = () => {
      const base = startedAtRef.current;
      if (base) {
        setElapsed(
          Math.max(0, Math.floor((Date.now() - new Date(base).getTime()) / 1000))
        );
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [booking?.bookingStatus]);

  const loadData = useCallback(async () => {
    try {
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

  const toggleStatus = async value => {
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 5) return 'Good night, 🌙';
    if (h < 12) return 'Good morning, 🌅';
    if (h < 17) return 'Good afternoon, ☀️';
    if (h < 21) return 'Good evening, 🌆';
    return 'Pleasent night, 🌙';
  };

  const todayEarnings = dashboard?.todayEarnings ?? '0';
  const todayTrips = dashboard?.todayTrips ?? '0';
  const rating =
    profile?.rating != null
      ? Number(profile.rating).toFixed(1)
      : dashboard?.rating != null
        ? Number(dashboard.rating).toFixed(1)
        : '5.0';
  const ratingCount = profile?.ratingCount ?? dashboard?.ratingCount ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={C.primary}
          colors={[C.primary]}
        />
      }
    >
      {/* ============ HERO ============ */}
      <Hero style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {profile?.fullName || 'Driver'}
            </Text>
            <View style={styles.locationRow}>
              <Icon name="location-on" size={15} color="#FFD9BC" />
              <Text style={styles.location}>
                {profile?.city
                  ? `${profile.city}, ${profile.state || ''}`
                  : 'Ready for trips'}
              </Text>
            </View>
          </View>

          <Avatar name={profile?.fullName || 'Driver'} size={62} />
        </View>

        {/* Availability */}
        <View style={styles.availRow}>
          <View style={styles.availLeft}>
            <Pulse color={isOnline ? C.success : C.textMuted} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.availTitle}>
                {isOnline ? "You're online" : "You're offline"}
              </Text>
              <Text style={styles.availSub}>
                {isOnline ? 'Receiving new trip requests' : 'Go online to get trips'}
              </Text>
            </View>
          </View>

          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            thumbColor="#fff"
            trackColor={{ false: 'rgba(255,255,255,0.3)', true: C.accent }}
          />
        </View>

        {/* Quick stats strip */}
        <View style={styles.heroStrip}>
          <View style={styles.heroStripItem}>
            <Text style={styles.heroStripValue}>₹{todayEarnings}</Text>
            <Text style={styles.heroStripLabel}>Today's earnings</Text>
          </View>
          <View style={styles.heroStripDivider} />
          <View style={styles.heroStripItem}>
            <Text style={styles.heroStripValue}>{todayTrips}</Text>
            <Text style={styles.heroStripLabel}>Trips today</Text>
          </View>
          <View style={styles.heroStripDivider} />
          <View style={styles.heroStripItem}>
            <Text style={styles.heroStripValue}>{rating} ★</Text>
            <Text style={styles.heroStripLabel}>
              {ratingCount > 0
                ? `${ratingCount} rating${ratingCount === 1 ? '' : 's'}`
                : 'Driver rating'}
            </Text>
          </View>
        </View>
      </Hero>

      {/* ============ TRIP SECTION ============ */}
      <Text style={styles.sectionLabel}>YOUR TRIP</Text>

      {booking ? (
        <View style={[styles.tripCard, styles.tripCardActive]}>
          <View style={styles.tripCardGlow} />
          <View style={styles.tripHeader}>
            <View style={styles.tripTitleWrap}>
              <Pill color={C.accentDark} bg="rgba(255,255,255,0.9)" icon="bolt">
                {booking.bookingNumber}
              </Pill>
              <Text style={styles.tripTitle}>
                {booking.bookingStatus === 'CONFIRMED'
                  ? 'Trip confirmed — head to pickup'
                  : booking.bookingStatus === 'ONGOING'
                    ? 'Trip in progress'
                    : booking.bookingStatus === 'Accepted'
                      ? 'Trip accepted — head to pickup'
                      : booking.bookingStatus === 'Reached Pickup'
                        ? 'Reached pickup'
                        : booking.bookingStatus === 'Trip Started'
                          ? 'Trip in progress'
                          : 'Trip in progress'}
              </Text>
            </View>
            <Icon name="directions-car" size={26} color="rgba(255,255,255,0.9)" />
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: C.success }]} />
            <Text style={styles.routeText}>
              {booking.pickupLocation?.address || booking.pickupAddress}
            </Text>
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: C.danger }]} />
            <Text style={styles.routeText}>
              {booking.dropLocation?.address || booking.dropAddress}
            </Text>
          </View>

          {booking.bookingStatus === 'ONGOING' && booking.startedAt ? (
            <>
              <View style={styles.timerRow}>
                <Icon name="timer" size={18} color="#FFD9BC" />
                <Text style={styles.timerText}>{formatElapsed(elapsed)}</Text>
                <View style={styles.timerPulse} />
              </View>
              <View style={styles.liveBillRow}>
                <Text style={styles.fareLabel}>
                  Running bill (~{liveBill(elapsed, booking.perHourRate).billableHours} hrs)
                </Text>
                <Text style={styles.liveBillValue}>
                  ₹{liveBill(elapsed, booking.perHourRate).total.toLocaleString('en-IN')}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Estimated fare</Text>
              <Text style={styles.fareValue}>
                ₹{booking.estimatedFare || booking.fare}
              </Text>
            </View>
          )}

          {onGoToTrips && (
            <TouchableOpacity style={styles.viewTripsBtn} onPress={onGoToTrips} activeOpacity={0.85}>
              <Icon name="flag" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.viewTripsText}>View in Trips</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : tripRequest ? (
        <View style={styles.reqCard}>
          <View style={styles.reqCardTop}>
            <Pill color={C.accent} bg={C.accentSoft} icon="bolt">
              New trip request
            </Pill>
            <Pulse color={C.accent} size={14} />
          </View>

          <View style={styles.reqUserRow}>
            <Avatar name={tripRequest.user || 'Customer'} size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.reqUserName}>{tripRequest.user}</Text>
              <Text style={styles.reqUserSub}>{tripRequest.price} • estimated</Text>
            </View>
          </View>

          <View style={styles.reqRouteRow}>
            <View style={[styles.reqRouteDot, { backgroundColor: C.success }]} />
            <Text style={styles.reqRouteText} numberOfLines={1}>
              {tripRequest.pickup}
            </Text>
          </View>
          <View style={styles.reqRouteRow}>
            <View style={[styles.reqRouteDot, { backgroundColor: C.danger }]} />
            <Text style={styles.reqRouteText} numberOfLines={1}>
              {tripRequest.drop}
            </Text>
          </View>

          {tripRequest.source === 'action' && (
            <Text style={styles.reqScheduleText}>
              {tripRequest.fromDate
                ? new Date(tripRequest.fromDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : ''}{' '}
              • {tripRequest.startTime || ''}–{tripRequest.endTime || ''} •{' '}
              {tripRequest.estimatedDurationHours || 0} hrs
            </Text>
          )}

          {onGoToTrips && (
            <TouchableOpacity
              style={styles.reqGoBtn}
              onPress={onGoToTrips}
              activeOpacity={0.85}
            >
              <Icon
                name="assignment-turned-in"
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.reqGoText}>View & Accept in Trips</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.tripCard}>
          <View style={styles.tripCardTop}>
            <View style={styles.tripCardIcon}>
              <Icon
                name={isOnline ? 'radar' : 'location-off'}
                size={26}
                color={isOnline ? C.accent : C.textSub}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.tripEmptyTitle}>
                {isOnline ? 'Waiting for trips' : 'No active trip'}
              </Text>
              <Text style={styles.tripEmptySub}>
                {isOnline
                  ? 'New requests appear here instantly. Keep notifications on.'
                  : "You're offline. Go online to start receiving requests."}
              </Text>
            </View>
          </View>

          {!isOnline && (
            <TouchableOpacity
              style={styles.goOnlineBtn}
              activeOpacity={0.85}
              onPress={() => toggleStatus(true)}
            >
              <Icon name="wifi" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.goOnlineText}>Go Online</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ============ SKIP BALANCE ============ */}
      {dashboard?.strikePolicy && Number(dashboard.strikePolicy.strikes) > 0 && (
        <View style={styles.skipWrap}>
          <SkipCounterBanner
            strikes={dashboard.strikePolicy.strikes}
            remaining={dashboard.strikePolicy.remaining}
            limit={dashboard.strikePolicy.limit}
            forced={dashboard.strikePolicy.forced}
          />
        </View>
      )}

      {/* ============ STATS ============ */}
      <Text style={styles.sectionLabel}>OVERVIEW</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statCircle, { backgroundColor: C.accentSoft }]}>
            <Icon name="account-balance-wallet" size={22} color={C.accent} />
          </View>
          <Text style={[styles.statValue, { color: C.accent }]}>
            ₹{dashboard?.monthlyEarnings ?? '0'}
          </Text>
          <Text style={styles.statLabel}>This month</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statCircle, { backgroundColor: C.primarySoft }]}>
            <Icon name="event-available" size={22} color={C.primary} />
          </View>
          <Text style={[styles.statValue, { color: C.primary }]}>
            {dashboard?.totalTrips ?? '0'}
          </Text>
          <Text style={styles.statLabel}>All-time trips</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    padding: 16,
    paddingBottom: 110,
  },

  /* ============ HERO ============ */
  hero: {
    marginBottom: 6,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  greeting: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  name: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginLeft: 4,
  },

  /* availability */
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  availLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  availSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 1,
  },

  /* hero strip */
  heroStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  heroStripItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStripValue: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  heroStripLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 2,
  },
  heroStripDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  /* ============ SECTIONS ============ */
  sectionLabel: {
    color: C.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
  },

  /* trip card */
  tripCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...C.shadow,
  },
  tripCardActive: {
    backgroundColor: C.primary,
    borderColor: C.primaryDark,
    overflow: 'hidden',
  },
  tripCardGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,106,0,0.28)',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tripTitleWrap: {
    flex: 1,
    paddingRight: 10,
  },
  tripTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  routeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    flexShrink: 1,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  fareLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  fareValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timerText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    marginLeft: 8,
    fontVariant: ['tabular-nums'],
  },
  timerPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
    backgroundColor: '#FFD9BC',
  },
  liveBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  liveBillValue: {
    color: '#FFD9BC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewTripsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: C.accent,
  },
  viewTripsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  /* empty trip card */
  tripCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripCardIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: C.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripEmptyTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  tripEmptySub: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  goOnlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 30,
    paddingVertical: 13,
    marginTop: 14,
    ...C.shadow,
    shadowOpacity: 0.22,
  },
  goOnlineText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  /* pending request card */
  reqCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    padding: 16,
    ...C.shadow,
    shadowOpacity: 0.1,
  },
  reqCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reqUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reqUserName: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reqUserSub: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 2,
  },
  reqRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reqRouteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  reqRouteText: {
    color: C.text,
    fontSize: 14,
    flexShrink: 1,
  },
  reqScheduleText: {
    color: C.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  reqGoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: C.accent,
    ...C.shadow,
    shadowOpacity: 0.22,
  },
  reqGoText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  skipWrap: {
    marginTop: 16,
  },

  /* stats row */
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48.5%',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...C.shadow,
  },
  statCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 2,
  },
});