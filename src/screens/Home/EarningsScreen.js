import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getDashboard, getEarnings } from '../../api';
import { C } from '../../theme';
import { Hero, StatCard, Pill } from '../../components/ui';

const fmt = value => {
  const n = Number(value || 0);
  return n % 1 === 0 ? String(n) : n.toFixed(2);
};

const EarningsScreen = () => {
  const [earnings, setEarnings] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [e, d] = await Promise.all([getEarnings(), getDashboard()]);
        setEarnings(e.data.earnings);
        setDashboard(d.data.dashboard || d.data);
      } catch (err) {
        console.log('EARNINGS ERR:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthly = earnings?.monthly || {};
  const weekly = earnings?.weekly || {};
  const total = earnings?.total || {};

  const monthlyTrips = monthly.totalTrips || '0';
  const monthlyNet = monthly.netEarnings || 0;
  const rating =
    dashboard?.rating != null ? Number(dashboard.rating).toFixed(1) : '5.0';

  const avgPerTrip =
    Number(monthly.totalTrips) > 0
      ? (monthlyNet / Number(monthly.totalTrips)).toFixed(0)
      : '0';

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingBox]}>
        <Text style={styles.loadingText}>Loading your earnings…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Top hero card */}
      <Hero style={styles.topCard}>
        <Pill color="#FFD9BC" bg="rgba(255,255,255,0.14)" icon="trending-up" style={styles.topPill}>
          This month
        </Pill>
        <Text style={styles.amount}>₹{fmt(monthlyNet)}</Text>
        <Text style={styles.growth}>
          {monthlyTrips} trips completed{rating ? ` • ${rating} ★ rating` : ''}
        </Text>
      </Hero>

      {/* Stats grid */}
      <View style={styles.grid}>
        <StatCard
          icon="event-available"
          label="Total trips"
          value={String(total.totalTrips || dashboard?.totalTrips || '0')}
          color={C.primary}
          style={styles.gridCard}
        />
        <StatCard
          icon="currency-rupee"
          label="Avg / trip"
          value={`₹${avgPerTrip}`}
          color={C.accent}
          bg={C.accentSoft}
          style={styles.gridCard}
        />
        <StatCard
          icon="star"
          label="Rating"
          value={`${rating}`}
          color={C.warning}
          bg={C.accentSoft}
          style={styles.gridCard}
        />
        <StatCard
          icon="calendar-month"
          label="Trips this month"
          value={`${monthlyTrips}`}
          color={C.text}
          bg={C.primarySoft}
          style={styles.gridCard}
        />
      </View>

      {/* Weekly summary */}
      <Text style={styles.sectionLabel}>This week</Text>
      <View style={styles.weekCard}>
        <View style={styles.weekRow}>
          <View style={styles.weekItem}>
            <MaterialIcons name="luggage" size={18} color={C.primary} />
            <Text style={styles.weekValue}>{weekly.totalTrips || 0}</Text>
            <Text style={styles.weekLabel}>Trips</Text>
          </View>
          <View style={styles.weekDivider} />
          <View style={styles.weekItem}>
            <MaterialIcons name="currency-rupee" size={18} color={C.accent} />
            <Text style={styles.weekValue}>₹{fmt(weekly.netEarnings || 0)}</Text>
            <Text style={styles.weekLabel}>Net earnings</Text>
          </View>
          <View style={styles.weekDivider} />
          <View style={styles.weekItem}>
            <MaterialIcons name="trending-up" size={18} color={C.success} />
            <Text style={styles.weekValue}>₹{fmt(weekly.grossEarnings || 0)}</Text>
            <Text style={styles.weekLabel}>Gross</Text>
          </View>
        </View>
      </View>

      {/* Commission / payout */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutGlow} />
        <View style={styles.payoutIcon}>
          <MaterialIcons name="account-balance-wallet" size={24} color={C.accent} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.payoutTitle}>Commission this month</Text>
          <Text style={styles.payoutAmount}>₹{fmt(monthly.commission || 0)}</Text>
          <Text style={styles.payoutHint}>
            {Number(monthly.totalTrips) > 0
              ? `From ${monthly.totalTrips} completed trip${monthly.totalTrips === 1 ? '' : 's'}`
              : 'No completed trips this month'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default EarningsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },

  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: C.textSub,
    fontSize: 14,
  },

  /* Top hero */
  topCard: {
    padding: 22,
    marginBottom: 15,
  },
  topPill: {
    marginBottom: 12,
  },
  amount: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  growth: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontSize: 13,
  },

  /* Stats grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48.5%',
    maxWidth: '48.5%',
    marginBottom: 10,
  },

  /* Section */
  sectionLabel: {
    color: C.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
  },

  /* Weekly card */
  weekCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 15,
    ...C.shadow,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekItem: {
    flex: 1,
    alignItems: 'center',
  },
  weekValue: {
    color: C.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  weekLabel: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  weekDivider: {
    width: 1,
    height: 34,
    backgroundColor: C.border,
  },

  /* Commission */
  payoutCard: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  payoutGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,106,0,0.1)',
  },
  payoutIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...C.shadow,
  },
  payoutTitle: {
    color: C.textSub,
    fontSize: 13,
  },
  payoutAmount: {
    color: C.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  payoutHint: {
    color: C.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});