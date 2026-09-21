import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDriverProfile, clearStoredToken } from '../../api';
import { useAlert } from '../../components/AlertProvider';
import { C } from '../../theme';
import { Hero } from '../../components/ui';

const POLL_INTERVAL = 8000;

const steps = [
  {
    icon: 'check-circle',
    color: C.success,
    title: 'Registration submitted',
    sub: 'Completed',
  },
  {
    icon: 'check-circle',
    color: C.success,
    title: 'Documents uploaded',
    sub: 'Completed',
  },
  {
    icon: 'hourglass-empty',
    color: C.warning,
    title: 'Admin verification',
    sub: 'In progress — typically within 24–48 hrs',
    highlight: true,
  },
  {
    icon: 'radio-button-unchecked',
    color: C.borderDark,
    title: 'Account activated',
    sub: 'Waiting for approval',
  },
];

const PendingApprovalScreen = () => {
  const navigation = useNavigation();
  const alert = useAlert();
  const [checking, setChecking] = useState(false);

  const checkApproval = async () => {
    try {
      const res = await getDriverProfile();
      const status = res.data?.driver?.verificationStatus;

      if (status === 'Approved') {
        setChecking(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        });
        return;
      }

      if (status === 'Rejected') {
        setChecking(false);
        await clearStoredToken();
        alert.error(
          'Application rejected',
          'Your application was rejected by the admin team.\nYou will be logged out.'
        );
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
    } catch (err) {
      // Network hiccup — keep polling, next tick will retry.
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setChecking(true);
      checkApproval();
      const interval = setInterval(checkApproval, POLL_INTERVAL);
      return () => clearInterval(interval);
    }, []),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <Hero style={styles.hero}>
        <View style={styles.iconCircle}>
          <Icon name="play-arrow" size={34} color="#fff" />
        </View>

        <Text style={styles.title}>Under Review</Text>
        <Text style={styles.subtitle}>
          Your documents are being verified by our admin team.{'\n'}
          You'll be taken to your dashboard automatically once approved.
        </Text>
      </Hero>

      {/* Progress card */}
      <View style={styles.card}>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <View key={step.title}>
              <View style={styles.row}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepIcon,
                      { backgroundColor: `${step.color}22` },
                    ]}
                  >
                    <Icon name={step.icon} size={20} color={step.color} />
                  </View>
                  {!isLast && <View style={styles.stepLine} />}
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[styles.stepTitle, step.highlight && styles.stepTitleActive]}
                  >
                    {step.title}
                  </Text>
                  <Text style={step.highlight ? styles.highlight : styles.stepSub}>
                    {step.sub}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Live status */}
      <View style={styles.liveRow}>
        <ActivityIndicator size="small" color={C.accent} animating={checking} />
        <Text style={styles.liveText}>
          {checking ? 'Checking for admin approval…' : 'Waiting for update…'}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PendingApprovalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },

  hero: {
    alignItems: 'center',
    paddingVertical: 34,
    paddingHorizontal: 24,
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 45,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    zIndex: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    zIndex: 1,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },

  row: {
    flexDirection: 'row',
    minHeight: 64,
  },
  stepLeft: {
    alignItems: 'center',
    width: 44,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: C.border,
    marginTop: 4,
    marginBottom: 4,
  },
  textWrap: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 16,
  },
  stepTitle: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  stepTitleActive: {
    color: C.warning,
  },
  stepSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  highlight: {
    color: C.warning,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 3,
  },

  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 10,
  },
  liveText: {
    color: C.textMuted,
    fontSize: 13,
  },
});