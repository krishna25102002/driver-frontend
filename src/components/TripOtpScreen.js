import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { startActionTrip, endActionTrip } from '../api';
import { useAlert } from './AlertProvider';
import { C } from '../theme';
import { Hero, PrimaryButton, StackHeader } from './ui';

const EXPIRY_MS = 5 * 60 * 1000;

const TripOtpScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const alert = useAlert();
  const { bookingId, bookingNumber, purpose } = route.params || {};
  const isEnd = purpose === 'end';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_MS / 1000);
  const [expiresAt, setExpiresAt] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const loadOtp = async () => {
    try {
      setExpiresAt(Date.now() + EXPIRY_MS);
    } catch (err) {
      console.log('CONFIG ERR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOtp();
    clearTimer();
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, []);

  useEffect(() => {
    if (expiresAt) setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
  }, [expiresAt]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const handleDigitChange = text => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    setOtp(digits);
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) {
      alert.warning('Enter OTP', 'Please enter the 4-digit OTP from the customer.');
      return;
    }
    if (!bookingId) {
      alert.error('Missing info', 'Missing booking information.');
      return;
    }
    setSubmitting(true);
    try {
      const call = isEnd ? endActionTrip : startActionTrip;
      const res = await call(bookingId, otp);
      clearTimer();
      alert.success(
        isEnd ? 'Trip Completed' : 'Trip Started',
        res.data?.message || 'OTP verified successfully.'
      );
      navigation.navigate('HomeTabs');
    } catch (err) {
      console.log('OTP SUBMIT ERR:', err.response?.data || err);
      alert.error('Could not verify OTP', err.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StackHeader
          title={isEnd ? 'End Trip' : 'Start Trip'}
          subtitle={bookingNumber || 'Booking'}
          onBack={() => navigation.goBack()}
        />

        {/* OTP hero strip */}
        <Hero style={styles.hero}>
          <View style={styles.lockCircle}>
            <MaterialIcons name={isEnd ? 'flag' : 'directions-car'} size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>
            Enter the {isEnd ? 'end' : 'start'} OTP
          </Text>
          <Text style={styles.heroSub}>
            Ask the customer to read aloud the 4-digit {isEnd ? 'end' : 'start'} OTP
            shown in their app.
          </Text>
        </Hero>

        {/* OTP boxes */}
        <View style={styles.otpBox}>
          <View style={styles.otpRow}>
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[styles.dotBox, otp[i] ? styles.dotBoxFilled : null]}>
                <Text style={styles.dotDigit}>{otp[i] || ''}</Text>
              </View>
            ))}
          </View>

          <TextInput
            style={styles.hiddenInput}
            value={otp}
            onChangeText={handleDigitChange}
            keyboardType="number-pad"
            autoFocus
            maxLength={4}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          {loading ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 14 }} />
          ) : secondsLeft > 0 && !submitting ? (
            <View style={styles.timerPill}>
              <MaterialIcons name="timer" size={16} color={secondsLeft < 60 ? C.danger : C.accent} />
              <Text style={[styles.validText, secondsLeft < 60 && { color: C.danger }]}>
                Valid for {mm}:{ss}
              </Text>
            </View>
          ) : null}
          {submitting && (
            <ActivityIndicator color={C.primary} style={{ marginTop: 14 }} />
          )}
        </View>

        <PrimaryButton
          title={isEnd ? 'End Trip' : 'Start Trip'}
          icon={isEnd ? 'flag' : 'directions-car'}
          loading={submitting}
          disabled={loading}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />

        <Text style={styles.footerTip}>
          The OTP expires after 5 minutes. Ask the customer to regenerate it if it
          runs out.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripOtpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  hero: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
  },
  lockCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    padding: 12,
    marginBottom: 12,
    zIndex: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    zIndex: 1,
  },

  otpBox: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderTopWidth: 3,
    borderTopColor: C.accent,
    padding: 26,
    alignItems: 'center',
    marginTop: 18,
    ...C.shadow,
    shadowOpacity: 0.1,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '86%',
  },
  dotBox: {
    width: 58,
    height: 62,
    borderRadius: 14,
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotBoxFilled: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  dotDigit: {
    color: C.accent,
    fontSize: 30,
    fontWeight: 'bold',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: C.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  validText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.8,
  },

  submitBtn: {
    marginTop: 22,
    paddingVertical: 16,
  },
  footerTip: {
    color: C.textMuted,
    textAlign: 'center',
    fontSize: 12,
    marginTop: 18,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});