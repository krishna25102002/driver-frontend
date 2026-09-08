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
import { getDriverProfile, updateDriverStatus, setAuthToken } from '../../api';
import { C } from '../../theme';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) setAuthToken(token);

        const res = await getDriverProfile();
        setProfile(res.data.driver || res.data);
        if (res.data.driver?.accountStatus) {
          setIsOnline(res.data.driver.accountStatus === 'Online');
        }
      } catch (err) {
        console.log('SETTINGS ERR:', err.response?.data || err);
      }
    };
    load();
  }, []);

  const toggleStatus = async (value) => {
    setIsOnline(value);
    try {
      await updateDriverStatus(value ? 'Online' : 'Offline');
    } catch (err) {
      console.log('STATUS ERR:', err.response?.data || err);
      setIsOnline(!value);
    }
  };

  const initials = profile?.fullName
    ? profile.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'DR';

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
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
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.fullName || 'Driver'}</Text>
          <Text style={styles.phone}>{profile?.mobileNumber || '—'}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, profile?.verificationStatus === 'Approved' ? styles.badgeVerified : styles.badgePending]}>
              <Text style={[styles.badgeText, profile?.verificationStatus === 'Approved' ? styles.badgeVerifiedText : styles.badgePendingText]}>
                {profile?.verificationStatus === 'Approved' ? 'Verified' : 'Pending'}
              </Text>
            </View>
            <View style={[styles.badge, styles.badgeRating]}>
              <Text style={styles.badgeRatingText}>{profile?.rating ?? '5.0'} ★</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Availability */}
      <Text style={styles.sectionTitle}>AVAILABILITY</Text>
      <View style={styles.group}>
        <SettingToggle icon="location-on" label="Online Status" value={isOnline} onValueChange={toggleStatus} />
        <View style={styles.groupDivider} />
        <SettingToggle icon="notifications" label="Trip Notifications" value={notifications} onValueChange={setNotifications} />
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>
      <View style={styles.group}>
        <SettingItem icon="person" label="Edit Profile" onPress={() => navigation.navigate('EditProfile')} />
        <View style={styles.groupDivider} />
        <SettingItem icon="account-balance" label="Bank Account" onPress={() => navigation.navigate('BankDetails')} />
        <View style={styles.groupDivider} />
        <SettingItem icon="description" label="My Documents" onPress={() => navigation.navigate('MyDocuments')} />
      </View>

      {/* Other */}
      <Text style={styles.sectionTitle}>OTHERS</Text>
      <View style={styles.group}>
        <SettingItem icon="help-outline" label="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
        <View style={styles.groupDivider} />
        <SettingItem icon="logout" label="Logout" danger onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const SettingToggle = ({ icon, label, value, onValueChange }) => (
  <View style={styles.itemRow}>
    <View style={styles.left}>
      <View style={[styles.iconBox, value && styles.iconBoxActive]}>
        <MaterialIcons name={icon} size={20} color={value ? C.primary : C.textMuted} />
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

const SettingItem = ({ icon, label, danger, onPress }) => (
  <TouchableOpacity style={styles.itemRow} onPress={onPress}>
    <View style={styles.left}>
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <MaterialIcons name={icon} size={20} color={danger ? C.danger : C.primary} />
      </View>
      <Text style={[styles.label, danger && { color: C.danger }]}>{label}</Text>
    </View>

    <MaterialIcons name="chevron-right" size={22} color={C.textMuted} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 15,
    paddingTop: 20,
    paddingBottom: 80,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    ...C.shadow,
    shadowOpacity: 0.3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  name: {
    color: C.text,
    fontSize: 19,
    fontWeight: 'bold',
  },
  phone: {
    color: C.textSub,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 10,
    borderRadius: 10,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeVerified: {
    backgroundColor: C.successSoft,
  },
  badgeVerifiedText: {
    color: C.success,
    fontSize: 11,
    fontWeight: '600',
  },
  badgePending: {
    backgroundColor: C.primarySoft,
  },
  badgePendingText: {
    color: C.primaryDark,
    fontSize: 11,
    fontWeight: '600',
  },
  badgeRating: {
    backgroundColor: C.inputBg,
  },
  badgeRatingText: {
    color: C.warning,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Sections
  sectionTitle: {
    color: C.primary,
    fontWeight: 'bold',
    marginVertical: 8,
    letterSpacing: 1,
    fontSize: 13,
  },

  group: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 15,
    paddingHorizontal: 14,
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
    paddingVertical: 12,
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
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primaryBorder,
  },
  iconBoxDanger: {
    backgroundColor: C.dangerSoft,
  },
  label: {
    color: C.text,
    fontSize: 15,
  },
});

export default SettingsScreen;