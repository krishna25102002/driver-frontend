import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Dashboard from './Dashboard';
import TripScreen from './TripScreen';
import EarningsScreen from './EarningsScreen';
import SettingsScreen from './SettingsScreen';
import { C } from '../../theme';

const HomeTabs = () => {
  const [selectedTab, setSelectedTab] = useState('Home');

  const renderScreen = () => {
    switch (selectedTab) {
      case 'Home':
        return <Dashboard />;
      case 'Trips':
        return <TripScreen />;
      case 'EarningsScreen':
        return <EarningsScreen />;
      case 'SettingsScreen':
        return <SettingsScreen />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {renderScreen()}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Home" active={selectedTab === 'Home'} onPress={() => setSelectedTab('Home')} />
        <NavItem icon="location-on" label="Trips" active={selectedTab === 'Trips'} onPress={() => setSelectedTab('Trips')} />
        <NavItem icon="attach-money" label="Earnings" active={selectedTab === 'EarningsScreen'} onPress={() => setSelectedTab('EarningsScreen')} />
        <NavItem icon="settings" label="Settings" active={selectedTab === 'Settings'} onPress={() => setSelectedTab('SettingsScreen')} />
      </View>
    </View>
  );
};

const NavItem = ({ icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <MaterialIcons name={icon} size={24} color={active ? C.primary : C.textMuted} />
    {active && <View style={styles.activeBar} />}
    <Text style={[styles.navText, active && { color: C.primary, fontWeight: 'bold' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    paddingVertical: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    ...C.shadow,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: -6,
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.primary,
  },
  navText: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
});

export default HomeTabs;