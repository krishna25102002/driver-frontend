import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDriver, setAuthToken } from "../../api";
import { C } from '../../theme';

const RegisterScreen = () => {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobileNumber: '',
    city: '',
    state: '',
    vehicleType: '',
    registrationNumber: '',
  });

  const handleRegister = async () => {
    try {
      // ✅ Validation
      if (!form.fullName || !form.email || !form.password) {
        Alert.alert('Error', 'Please fill account details');
        return;
      }

      if (!form.mobileNumber || !form.city || !form.vehicleType) {
        Alert.alert('Error', 'Please fill driver details');
        return;
      }

      if (!form.registrationNumber) {
        Alert.alert('Error', 'Please enter vehicle registration number');
        return;
      }

      // 🔥 Match backend format
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        mobileNumber: form.mobileNumber,
        city: form.city,
        state: form.state,
        vehicleType: form.vehicleType,
        registrationNumber: form.registrationNumber,
      };

      console.log("📤 Sending payload:", payload);

      const res = await registerDriver(payload);

      console.log("✅ Response:", res.data);

      const driverId = res.data.driver?._id || res.data.driver?.id;

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        setAuthToken(res.data.token);
        console.log("✅ Token saved");
      } else {
        console.log("⚠️ Token not found in response");
      }

      Alert.alert('Success', 'Driver Registered');

      navigation.navigate('UploadDocuments', { driverId });

    } catch (err) {
      console.log("❌ ERROR:", err);
      console.log("❌ ERROR DATA:", err.response?.data);

      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to login</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Become a Driver</Text>
        <Text style={styles.heroSubtitle}>Fill in your details to get started</Text>
      </View>

      {/* ACCOUNT */}
      <Text style={styles.sectionTitle}>Account Details</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        value={form.fullName}
        onChangeText={(t) => setForm({ ...form, fullName: t })}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        keyboardType="email-address"
        value={form.email}
        onChangeText={(t) => setForm({ ...form, email: t })}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(t) => setForm({ ...form, password: t })}
      />

      {/* DRIVER DETAILS */}
      <Text style={styles.sectionTitle}>Driver Details</Text>

      <TextInput
        placeholder="Phone Number"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        keyboardType="phone-pad"
        value={form.mobileNumber}
        onChangeText={(t) => setForm({ ...form, mobileNumber: t })}
      />

      <View style={styles.row}>
        <TextInput
          placeholder="City"
          placeholderTextColor={C.textMuted}
          style={[styles.input, styles.half]}
          value={form.city}
          onChangeText={(t) => setForm({ ...form, city: t })}
        />
        <TextInput
          placeholder="State"
          placeholderTextColor={C.textMuted}
          style={[styles.input, styles.half]}
          value={form.state}
          onChangeText={(t) => setForm({ ...form, state: t })}
        />
      </View>

      <Text style={styles.label}>Vehicle Type</Text>
      <View style={styles.typeRow}>
        {['Hatchback', 'Sedan', 'SUV', 'MUV', 'Bike'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, form.vehicleType === type && styles.typeChipActive]}
            onPress={() => setForm({ ...form, vehicleType: type })}
          >
            <Text style={[styles.typeChipText, form.vehicleType === type && styles.typeChipTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Vehicle Registration Number"
        placeholderTextColor={C.textMuted}
        style={styles.input}
        value={form.registrationNumber}
        onChangeText={(t) => setForm({ ...form, registrationNumber: t })}
      />

      {/* BUTTON */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.btnText}>Next — Upload Documents</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
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
    paddingTop: 20,
  },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  backText: {
    color: C.accent,
    fontWeight: '600',
  },

  hero: {
    backgroundColor: C.primary,
    borderRadius: 22,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...C.shadow,
    shadowOpacity: 0.22,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    color: C.primary,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: C.surface,
    color: C.text,
    padding: 14,
    borderRadius: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    color: C.textSub,
    fontSize: 14,
    marginTop: 12,
    marginBottom: 6,
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
    borderRadius: 20,
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

  half: {
    width: '48%',
  },

  button: {
    backgroundColor: C.accent,
    padding: 16,
    borderRadius: 30,
    marginTop: 24,
    alignItems: 'center',
    ...C.shadow,
    shadowOpacity: 0.28,
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});