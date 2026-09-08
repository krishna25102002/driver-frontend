import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, generateOtp } from '../api';
import { C } from '../theme';

const TripOtpScreen = () => {
  const route = useRoute();
  const { bookingNumber } = route.params || {};

  const [otp, setOtp] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('Customer');

  const loadOtp = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) setAuthToken(token);

      const res = await generateOtp(bookingNumber);
      const digits = String(res.data.otp).split('').map((d) => Number(d));
      setOtp(digits);
      if (res.data.booking?.customerId?.fullName) {
        setCustomerName(res.data.booking.customerId.fullName);
      }
    } catch (err) {
      console.log('OTP ERR:', err.response?.data || err);
      Alert.alert('Error', err.response?.data?.message || 'Could not generate OTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero Header */}
      <View style={styles.hero}>
        <View style={styles.lockCircle}>
          <MaterialIcons name="lock" size={26} color="#fff" />
        </View>
        <Text style={styles.heroTitle}>Booking {bookingNumber}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Share OTP with Customer</Text>

      <Text style={styles.subtitle}>
        Give this OTP to the customer.{"\n"}Trip starts once they verify it.
      </Text>

      {/* OTP Box */}
      <View style={styles.otpBox}>
        <Text style={styles.otpLabel}>Your Trip OTP</Text>

        <View style={styles.otpRow}>
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            otp.map((digit, index) => (
              <Text key={index} style={styles.otpDigit}>
                {digit}
              </Text>
            ))
          )}
        </View>

        <Text style={styles.validText}>Valid for 5 minutes only</Text>
      </View>

      {/* Customer Card */}
      <View style={styles.customerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(customerName || 'C').substring(0, 2).toUpperCase()}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.customerType}>Customer</Text>
        </View>

        <View style={styles.statusBadge}>
          <View style={[styles.dot, { backgroundColor: C.warning }]} />
          <Text style={styles.statusText}>Waiting OTP</Text>
        </View>
      </View>

      <Text style={styles.footerTip}>
        Ask the customer to enter this OTP in their app to start the trip
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
    alignItems: 'center',
  },

  // Hero
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: C.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    ...C.shadow,
    shadowOpacity: 0.25,
  },
  lockCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 28,
    padding: 10,
    marginRight: 14,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Title
  title: {
    color: C.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: C.textSub,
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 20,
  },

  // OTP Box
  otpBox: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    padding: 22,
    alignItems: 'center',
    marginTop: 10,
    ...C.shadow,
  },
  otpLabel: {
    color: C.textSub,
    marginBottom: 10,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '82%',
  },
  otpDigit: {
    color: C.accent,
    fontSize: 46,
    fontWeight: 'bold',
  },
  validText: {
    color: C.textMuted,
    marginTop: 10,
    fontSize: 12,
  },

  // Customer Card
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 15,
    marginTop: 30,
    width: '100%',
  },
  avatar: {
    backgroundColor: C.primarySoft,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  avatarText: {
    color: C.primaryDark,
    fontWeight: 'bold',
  },
  customerName: {
    color: C.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerType: {
    color: C.textSub,
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    backgroundColor: C.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    alignSelf: 'center',
  },
  statusText: {
    color: C.accentDark,
    fontSize: 12,
    fontWeight: 'bold',
  },

  footerTip: {
    color: C.textMuted,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    paddingHorizontal: 20,
  },
});

export default TripOtpScreen;