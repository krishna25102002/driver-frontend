import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getDriverProfile, updateDriverProfile, getVehicles } from '../api';
import { C } from '../theme';
import { StackHeader, PrimaryButton } from './ui';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    experience: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, vehicleRes] = await Promise.all([
          getDriverProfile(),
          getVehicles(),
        ]);
        const profile = profileRes.data.driver || profileRes.data;
        setMobileNumber(profile.mobileNumber || '');
        setForm({
          fullName: profile.fullName || '',
          email: profile.email || '',
          gender: profile.gender || '',
          dateOfBirth: profile.dateOfBirth
            ? String(profile.dateOfBirth).slice(0, 10)
            : '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          pincode: profile.pincode || '',
          bloodGroup: profile.bloodGroup || '',
          emergencyContactName: profile.emergencyContactName || '',
          emergencyContactNumber: profile.emergencyContactNumber || '',
          experience: profile.experience != null ? String(profile.experience) : '',
        });
        const vehicles = vehicleRes.data?.vehicles || [];
        if (vehicles.length > 0) setVehicle(vehicles[0]);
      } catch (err) {
        console.log('EDIT PROFILE LOAD ERR:', err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const set = key => value => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.fullName) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    const payload = {};
    Object.keys(form).forEach(key => {
      if (form[key] !== undefined && form[key] !== '') {
        payload[key] = form[key];
      }
    });

    setSaving(true);
    try {
      await updateDriverProfile(payload);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      console.log('EDIT PROFILE SAVE ERR:', err.response?.data || err);
      Alert.alert('Error', err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader
          title="Edit Profile"
          subtitle="Update your personal details"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StackHeader
          title="Edit Profile"
          subtitle="Update your personal details"
          onBack={() => navigation.goBack()}
        />

        {/* Personal details */}
        <Text style={styles.sectionLabel}>Personal details</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="person" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={set('fullName')}
              placeholder="Enter name"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Mobile number (not editable)</Text>
          <View style={[styles.inputBox, styles.readOnlyBox]}>
            <MaterialIcons name="phone" size={20} color={C.textMuted} />
            <Text style={styles.readOnly}>{mobileNumber || '—'}</Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="email" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={set('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter email"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Address</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="home" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={set('address')}
              placeholder="Enter address"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="wc" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.gender}
              onChangeText={set('gender')}
              placeholder="Enter gender"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Date of birth</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="cake" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.dateOfBirth}
              onChangeText={set('dateOfBirth')}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="location-city" size={20} color={C.accent} />
                <TextInput
                  style={styles.input}
                  value={form.city}
                  onChangeText={set('city')}
                  placeholder="City"
                  placeholderTextColor={C.textMuted}
                />
              </View>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>State</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="map" size={20} color={C.accent} />
                <TextInput
                  style={styles.input}
                  value={form.state}
                  onChangeText={set('state')}
                  placeholder="State"
                  placeholderTextColor={C.textMuted}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Pincode</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="pin" size={20} color={C.accent} />
                <TextInput
                  style={styles.input}
                  value={form.pincode}
                  onChangeText={set('pincode')}
                  keyboardType="number-pad"
                  placeholder="Pincode"
                  placeholderTextColor={C.textMuted}
                />
              </View>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Experience (yrs)</Text>
              <View style={styles.inputBox}>
                <MaterialIcons name="speed" size={20} color={C.accent} />
                <TextInput
                  style={styles.input}
                  value={form.experience}
                  onChangeText={set('experience')}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Blood group</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="water-drop" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.bloodGroup}
              onChangeText={set('bloodGroup')}
              autoCapitalize="characters"
              placeholder="e.g. O+"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Emergency contact name</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="contact-phone" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.emergencyContactName}
              onChangeText={set('emergencyContactName')}
              placeholder="Contact name"
              placeholderTextColor={C.textMuted}
            />
          </View>

          <Text style={styles.label}>Emergency contact number</Text>
          <View style={styles.inputBox}>
            <MaterialIcons name="phone-in-talk" size={20} color={C.accent} />
            <TextInput
              style={styles.input}
              value={form.emergencyContactNumber}
              onChangeText={set('emergencyContactNumber')}
              keyboardType="phone-pad"
              placeholder="Contact number"
              placeholderTextColor={C.textMuted}
            />
          </View>
        </View>

        {/* Vehicle Info Card */}
        <Text style={styles.sectionLabel}>Vehicle info</Text>
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleIcon}>
            <MaterialIcons
              name={vehicle?.vehicleType ? 'directions-car' : 'directions-bike'}
              size={22}
              color={C.accent}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vehicleTitle}>
              {vehicle?.vehicleType || 'No vehicle added'}
            </Text>
            <Text style={styles.vehicleSub}>
              {vehicle?.registrationNumber || 'Contact support to add your vehicle'}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <PrimaryButton
          title="Save Changes"
          icon="check"
          loading={saving}
          onPress={handleSave}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingBox: {
    alignItems: 'center',
    marginTop: 60,
  },

  sectionLabel: {
    color: C.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 6,
  },

  form: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    ...C.shadow,
  },
  label: {
    color: C.textSub,
    marginBottom: 6,
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: C.text,
    padding: 13,
    marginLeft: 8,
  },
  readOnlyBox: {
    opacity: 0.7,
  },
  readOnly: {
    flex: 1,
    color: C.textMuted,
    padding: 13,
    marginLeft: 8,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfCol: {
    width: '48.5%',
  },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.accentSoft,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.accentBorder,
    padding: 14,
  },
  vehicleIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...C.shadow,
  },
  vehicleTitle: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  vehicleSub: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 2,
  },

  saveBtn: {
    marginTop: 28,
    paddingVertical: 15,
  },
});