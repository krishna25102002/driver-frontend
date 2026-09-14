import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getDriverProfile } from '../api';
import { C } from '../theme';
import { StackHeader } from './ui';

const BankDetailsScreen = () => {
  const navigation = useNavigation();
  const [accountHolder, setAccountHolder] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDriverProfile();
        const profile = res.data.driver || res.data;
        setAccountHolder(profile.fullName || '');
      } catch (err) {
        console.log('BANK LOAD ERR:', err.response?.data || err);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StackHeader
          title="Bank Details"
          subtitle="Payout account for earnings"
          onBack={() => navigation.goBack()}
        />

        {/* Identity card */}
        <View style={styles.bankCard}>
          <View style={styles.bankCardGlow} />
          <View style={styles.bankHeader}>
            <View style={styles.bankIcon}>
              <MaterialIcons name="account-balance" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.bankName}>{accountHolder || 'Driver'}</Text>
              <Text style={styles.bankTag}>Account holder</Text>
            </View>
            <View style={styles.pendingPill}>
              <MaterialIcons name="hourglass-empty" size={12} color="#FFD9BC" />
              <Text style={styles.pendingText}>Not set up</Text>
            </View>
          </View>
        </View>

        {/* Not-available state */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <MaterialIcons name="info-outline" size={26} color={C.info} />
          </View>
          <Text style={styles.infoTitle}>Payout account coming soon</Text>
          <Text style={styles.infoText}>
            Your earnings are credited to your bank account. Add your bank
            details once payouts are enabled to receive your payments.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BankDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Identity card */
  bankCard: {
    backgroundColor: C.primary,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    ...C.shadow,
    shadowOpacity: 0.3,
  },
  bankCardGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,106,0,0.28)',
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  bankName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    zIndex: 1,
  },
  bankTag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    zIndex: 1,
  },
  pendingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
    zIndex: 1,
  },
  pendingText: {
    color: '#FFD9BC',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
  },

  /* Info state */
  infoCard: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    marginTop: 18,
    ...C.shadow,
  },
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: C.infoSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    color: C.textSub,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});