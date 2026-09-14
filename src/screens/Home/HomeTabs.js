import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Dashboard from './Dashboard';
import TripScreen from './TripScreen';
import EarningsScreen from './EarningsScreen';
import SettingsScreen from './SettingsScreen';
import { C } from '../../theme';

const TABS = [
  { key: 'Home', icon: 'home', label: 'Home' },
  { key: 'Trips', icon: 'location-on', label: 'Trips' },
  { key: 'EarningsScreen', icon: 'attach-money', label: 'Earnings' },
  { key: 'SettingsScreen', icon: 'settings', label: 'Settings' },
];

const HomeTabs = () => {
  const [selectedTab, setSelectedTab] = useState('Home');

  const renderScreen = () => {
    switch (selectedTab) {
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
    <View style={styles.wrapper}>
      {renderScreen()}

      {/* Floating pill bottom navigation */}
      <View style={styles.bottomNav}>
        {TABS.map(tab => {
          const active = selectedTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              activeOpacity={0.75}
              onPress={() => setSelectedTab(tab.key)}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                <MaterialIcons
                  name={tab.icon}
                  size={22}
                  color={active ? C.accent : C.textMuted}
                />
              </View>
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default HomeTabs;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: C.bg,
  },

  bottomNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
    shadowOpacity: 0.14,
    elevation: 12,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 3,
  },

  iconWrap: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapActive: {
    backgroundColor: C.accentSoft,
  },

  navText: {
    color: C.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },

  navTextActive: {
    color: C.accent,
    fontWeight: 'bold',
  },
});