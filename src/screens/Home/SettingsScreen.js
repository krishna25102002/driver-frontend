import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getDriverProfile,
  getSettings,
  getVehicles,
  updateDriverStatus,
  updateNotification,
} from '../../api';
import { C } from '../../theme';
import { Hero, Pill } from '../../components/ui';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [profile, setProfile] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, settingsRes, vehicleRes] = await Promise.all([
          getDriverProfile(),
          getSettings(),
          getVehicles(),
        ]);
        setProfile(profileRes.data.driver || profileRes.data);
        if (profileRes.data.driver?.accountStatus) {
          setIsOnline(profileRes.data.driver.accountStatus === 'Online');
        }
        setNotifications(
          settingsRes.data.settings?.settings?.notifications ?? true
        );
        const vehicles = vehicleRes.data?.vehicles || [];
        if (vehicles.length > 0) setVehicle(vehicles[0]);
      } catch (err) {
        console.log('SETTINGS ERR:', err.response?.data || err);
      }
    };
    load();
  }, []);

  const toggleStatus = async value => {
    setIsOnline(value);
    try {
      await updateDriverStatus(value ? 'Online' : 'Offline');
    } catch (err) {
      console.log('STATUS ERR:', err.response?.data || err);
      setIsOnline(!value);
    }
  };

  const toggleNotifications = async value => {
    setNotifications(value);
    try {
      await updateNotification(value);
    } catch (err) {
      console.log('NOTIFICATION ERR:', err.response?.data || err);
      setNotifications(!value);
    }
  };

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DR';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (error) {
            console.log('Logout Error:', error);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile hero */}
      <Hero style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.heroName}>{profile?.fullName || 'Driver'}</Text>
            <View style={styles.heroPhoneRow}>
              <MaterialIcons name="phone" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.heroPhone}>{profile?.mobileNumber || '—'}</Text>
            </View>
            <View style={styles.heroBadges}>
              <Pill
                color={C.success}
                bg="rgba(255,255,255,0.14)"
                icon={profile?.verificationStatus === 'Approved' ? 'verified' : 'hourglass-empty'}
                style={styles.heroBadge}
              >
                {profile?.verificationStatus === 'Approved' ? 'Verified' : 'Pending'}
              </Pill>
              <Pill color="#FFD9BC" bg="rgba(255,255,255,0.14)" icon="star">
                {profile?.rating ?? '5.0'}
              </Pill>
            </View>
          </View>
        </View>

        <View style={styles.heroStrip}>
          <View style={styles.heroStripItem}>
            <View
              style={[styles.statusDotActive, !isOnline && styles.statusDotOff]}
            />
            <Text style={styles.heroStripText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          <View style={styles.heroStripDivider} />
          <View style={styles.heroStripItem}>
            <MaterialIcons
              name={vehicle?.vehicleType ? 'directions-car' : 'directions-bike'}
              size={14}
              color={C.accent}
            />
            <Text style={styles.heroStripText}>
              {vehicle?.vehicleType || '—'}
              {vehicle?.registrationNumber
                ? ` • ${vehicle.registrationNumber.toUpperCase()}`
                : ''}
            </Text>
          </View>
        </View>
      </Hero>

      {/* Availability */}
      <Text style={styles.sectionLabel}>Availability</Text>
      <View style={styles.group}>
        <SettingToggle
          icon="location-on"
          label="Online status"
          value={isOnline}
          onValueChange={toggleStatus}
        />
        <View style={styles.groupDivider} />
        <SettingToggle
          icon="notifications"
          label="Trip notifications"
          value={notifications}
          onValueChange={toggleNotifications}
        />
      </View>

      {/* Account */}
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.group}>
        <SettingItem
          icon="person"
          tint={C.primary}
          label="Edit profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <View style={styles.groupDivider} />
        <SettingItem
          icon="account-balance"
          tint={C.primary}
          label="Bank account"
          onPress={() => navigation.navigate('BankDetails')}
        />
        <View style={styles.groupDivider} />
        <SettingItem
          icon="description"
          tint={C.primary}
          label="My documents"
          onPress={() => navigation.navigate('MyDocuments')}
        />
      </View>

      {/* Other */}
      <Text style={styles.sectionLabel}>Other</Text>
      <View style={styles.group}>
        <SettingItem
          icon="headset-mic"
          tint={C.info}
          label="Help & support"
          onPress={() => navigation.navigate('HelpSupport')}
        />
        <View style={styles.groupDivider} />
        <SettingItem
          icon="logout"
          tint={C.danger}
          label="Logout"
          danger
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};

const SettingToggle = ({ icon, label, value, onValueChange }) => (
  <View style={styles.itemRow}>
    <View style={styles.left}>
      <View style={[styles.iconBox, value && styles.iconBoxActive]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={value ? C.accent : C.textMuted}
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>

    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: C.borderDark, true: C.accent }}
      thumbColor="#fff"
    />
  </View>
);

const SettingItem = ({ icon, label, danger, tint = C.primary, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.left}>
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={danger ? C.danger : tint}
        />
      </View>
      <Text style={[styles.label, danger && { color: C.danger }]}>{label}</Text>
    </View>

    <MaterialIcons
      name="chevron-right"
      size={22}
      color={C.textMuted}
    />
  </TouchableOpacity>
);

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },

  /* Hero */
  hero: {
    padding: 20,
    marginBottom: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  heroName: {
    color: '#fff',
    fontSize: 21,
    fontWeight: 'bold',
  },
  heroPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  heroPhone: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginLeft: 5,
  },
  heroBadges: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroBadge: {
    marginRight: 8,
  },

  heroStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroStripItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStripText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  heroStripDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statusDotActive: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: C.success,
  },
  statusDotOff: {
    backgroundColor: C.textMuted,
  },

  /* Sections */
  sectionLabel: {
    color: C.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
  },

  group: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 6,
    paddingHorizontal: 14,
    ...C.shadow,
  },

  groupDivider: {
    height: 1,
    backgroundColor: C.border,
    marginLeft: 50,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconBoxActive: {
    backgroundColor: C.accentSoft,
  },
  iconBoxDanger: {
    backgroundColor: C.dangerSoft,
  },
  label: {
    color: C.text,
    fontSize: 15,
    fontWeight: '600',
  },
});