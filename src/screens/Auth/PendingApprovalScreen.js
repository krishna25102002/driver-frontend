import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C } from '../../theme';

const PendingApprovalScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Icon name="play-arrow" size={34} color="#fff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Under Review</Text>

        <Text style={styles.subtitle}>
          Your documents are being verified by our admin team.
          {"\n"}You'll be notified once approved.
        </Text>
      </View>

      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="check-circle" size={24} color={C.success} />
          <View style={styles.textWrap}>
            <Text style={styles.successText}>Registration submitted</Text>
            <Text style={styles.subText}>Completed</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Icon name="check-circle" size={24} color={C.success} />
          <View style={styles.textWrap}>
            <Text style={styles.successText}>Documents uploaded</Text>
            <Text style={styles.subText}>4/4 complete</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Icon name="hourglass-empty" size={24} color={C.warning} />
          <View style={styles.textWrap}>
            <Text style={styles.pendingText}>Admin verification</Text>
            <Text style={styles.highlight}>In Progress — 24–48 hrs</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Icon name="radio-button-unchecked" size={24} color={C.borderDark} />
          <View style={styles.textWrap}>
            <Text style={styles.disabledText}>Account activated</Text>
            <Text style={styles.subText}>Pending</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.replace('HomeTabs')}
      >
        <Text style={styles.skipText}>Continue (Dev)</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PendingApprovalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    backgroundColor: C.primary,
    borderRadius: 24,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    ...C.shadow,
    shadowOpacity: 0.25,
  },

  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 45,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },

  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.border,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },

  textWrap: {
    marginLeft: 12,
  },

  successText: {
    color: C.text,
    fontWeight: 'bold',
  },

  pendingText: {
    color: C.text,
    fontWeight: 'bold',
  },

  disabledText: {
    color: C.textMuted,
  },

  subText: {
    color: C.textMuted,
    fontSize: 12,
  },

  highlight: {
    color: C.warning,
    fontWeight: '600',
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 8,
  },

  // temporary
  skipBtn: {
    marginTop: 24,
    backgroundColor: C.accent,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    ...C.shadow,
    shadowOpacity: 0.25,
  },

  skipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});