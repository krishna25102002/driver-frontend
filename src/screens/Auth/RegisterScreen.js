import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDriver, setAuthToken } from '../../api';
import { useAlert } from '../../components/AlertProvider';
import { C } from '../../theme';
import { Hero, PrimaryButton } from '../../components/ui';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const alert = useAlert();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    city: '',
    state: '',
    vehicleType: '',
  });

  const handleRegister = async () => {
    try {
      if (!form.fullName || !form.email || !form.password) {
        alert.warning('Missing account details', 'Please fill account details');
        return;
      }

      if (!form.mobileNumber || !form.city || !form.vehicleType) {
        alert.warning('Missing driver details', 'Please fill driver details');
        return;
      }

      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        mobileNumber: form.mobileNumber,
        city: form.city,
        state: form.state,
        vehicleType: form.vehicleType,
      };

      const res = await registerDriver(payload);

      const driverId = res.data.driver?._id || res.data.driver?.id;

      if (res.data.token) {
        await AsyncStorage.setItem('token', res.data.token);
        setAuthToken(res.data.token);
      }

      alert.success('Driver Registered', 'Your account is ready. Upload your documents to get approved.');

      navigation.navigate('UploadDocuments', { driverId });
    } catch (err) {
      console.log('REGISTER ERR:', err.response?.data || err);
      alert.error('Registration failed', err.response?.data?.message || 'Something went wrong');
    }
  };

  const set = key => value => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.backText}>← Back to login</Text>
      </TouchableOpacity>

      <Hero style={styles.hero}>
        <Text style={styles.heroTitle}>Become a Driver Partner</Text>
        <Text style={styles.heroSubtitle}>Fill in your details to get started</Text>
      </Hero>

      {/* ACCOUNT */}
      <Text style={styles.sectionTitle}>Account details</Text>

      <TextInput
        placeholder="Full name"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        value={form.fullName}
        onChangeText={set('fullName')}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={set('email')}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={set('password')}
      />

      {/* DRIVER DETAILS */}
      <Text style={styles.sectionTitle}>Driver details</Text>

      <TextInput
        placeholder="Phone number"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        keyboardType="phone-pad"
        value={form.mobileNumber}
        onChangeText={set('mobileNumber')}
      />

      <View style={styles.row}>
        <TextInput
          placeholder="City"
          placeholderTextColor={C.textMuted}
          style={[styles.input, styles.half]}
          value={form.city}
          onChangeText={set('city')}
        />
        <TextInput
          placeholder="State"
          placeholderTextColor={C.textMuted}
          style={[styles.input, styles.half]}
          value={form.state}
          onChangeText={set('state')}
        />
      </View>

      <Text style={styles.label}>Vehicle type</Text>
      <View style={styles.typeRow}>
        {['Hatchback', 'Sedan', 'SUV', 'MUV', 'Bike'].map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, form.vehicleType === type && styles.typeChipActive]}
            onPress={() => setForm({ ...form, vehicleType: type })}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.typeChipText, form.vehicleType === type && styles.typeChipTextActive]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton
        title="Next — Upload Documents"
        icon="arrow-forward"
        onPress={handleRegister}
        style={styles.button}
      />
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },
  backText: {
    color: C.accent,
    fontWeight: '700',
  },

  hero: {
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
    zIndex: 1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    zIndex: 1,
  },

  sectionTitle: {
    fontSize: 14,
    color: C.primary,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  input: {
    backgroundColor: C.surface,
    color: C.text,
    padding: 14,
    borderRadius: 14,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  half: {
    width: '48.5%',
  },

  label: {
    color: C.textSub,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
    fontWeight: '600',
  },

  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  typeChip: {
    backgroundColor: C.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
  },

  typeChipActive: {
    backgroundColor: C.accent,
    borderColor: C.accent,
    ...C.shadow,
    shadowOpacity: 0.2,
  },

  typeChipText: {
    color: C.textSub,
    fontWeight: '600',
  },

  typeChipTextActive: {
    color: '#fff',
  },

  button: {
    marginTop: 26,
    paddingVertical: 16,
  },
});