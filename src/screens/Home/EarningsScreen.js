import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, getDashboard, getEarnings } from '../../api';
import { C } from '../../theme';

const EarningsScreen = () => {
  const weeklyData = [60, 90, 40, 120, 100, 110, 50];
  const [monthlyEarnings, setMonthlyEarnings] = useState('0');
  const [totalTrips, setTotalTrips] = useState('0');
  const [monthlyTrips, setMonthlyTrips] = useState('0');
  const [rating, setRating] = useState('5.0');

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) setAuthToken(token);

        const [d, e] = await Promise.all([getDashboard(), getEarnings()]);
        const dash = d.data.dashboard || d.data;

        setMonthlyEarnings(String(dash.monthlyEarnings ?? '0'));
        setTotalTrips(String(dash.totalTrips ?? '0'));
        setMonthlyTrips(String(dash.monthlyTrips ?? '0'));
        setRating(dash.rating != null ? Number(dash.rating).toFixed(1) : '5.0');
      } catch (err) {
        console.log('EARNINGS ERR:', err.response?.data || err);
      }
    };
    load();
  }, []);

  const avgPerTrip = Number(totalTrips) > 0
    ? (Number(monthlyEarnings) / Math.max(Number(totalTrips), 1)).toFixed(0)
    : '0';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Card */}
      <View style={styles.topCard}>
        <View>
          <Text style={styles.month}>This Month</Text>
          <Text style={styles.amount}>₹{monthlyEarnings}</Text>
          <Text style={styles.growth}>{monthlyTrips} trips completed</Text>
        </View>
        <View style={styles.topIconCircle}>
          <MaterialIcons name="trending-up" size={28} color="#fff" />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.grid}>
        <StatCard title="Total Trips" value={totalTrips} highlight accent />
        <StatCard title="Avg / Trip" value={`₹${avgPerTrip}`} />
        <StatCard title="Rating" value={`${rating} ★`} highlight />
        <StatCard title="This Month" value={monthlyTrips} />
      </View>

      {/* Weekly Earnings */}
      <Text style={styles.sectionTitle}>Weekly earnings</Text>

      <View style={styles.chartCard}>
        <View style={styles.chart}>
          {weeklyData.map((value, index) => {
            const active = index === 3;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: value,
                      backgroundColor: active ? C.accent : C.primarySoft,
                    },
                  ]}
                />
                <Text style={[styles.day, active && { color: C.accent, fontWeight: 'bold' }]}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Pending Payout */}
      <View style={styles.payoutCard}>
        <View>
          <Text style={styles.payoutTitle}>Pending Payout</Text>
          <Text style={styles.payoutAmount}>₹0</Text>
          <Text style={styles.payoutHint}>Transferred every Friday</Text>
        </View>

        <View style={styles.withdrawBtn}>
          <Text style={styles.withdrawText}>Withdraw</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, highlight, accent }) => (
  <View style={styles.statCard}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={[styles.statValue, highlight && { color: C.accent }, accent && styles.statValueAccent]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 15,
    paddingBottom: 80,
  },

  // Top Card
  topCard: {
    backgroundColor: C.primary,
    borderRadius: 22,
    padding: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    ...C.shadow,
    shadowOpacity: 0.28,
  },
  month: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
  },
  amount: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  growth: {
    color: 'rgba(255,255,255,0.9)',
  },
  topIconCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 12,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: C.surface,
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  statTitle: {
    color: C.textSub,
    fontSize: 13,
  },
  statValue: {
    color: C.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statValueAccent: {
    color: C.primary,
  },

  // Chart
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 5,
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 6,
  },
  day: {
    color: C.textMuted,
    marginTop: 5,
    fontSize: 12,
  },

  // Payout
  payoutCard: {
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  withdrawBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 30,
    ...C.shadow,
    shadowOpacity: 0.25,
  },
  withdrawText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default EarningsScreen;