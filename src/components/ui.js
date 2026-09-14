import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import C from '../theme';

/* ------------------------------------------------------------
   Avatar — initials circle
------------------------------------------------------------ */
export const Avatar = ({
  name = 'Driver',
  size = 48,
  style,
  textStyle,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map(w => (w[0] || ''))
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DR';

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: C.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...C.shadow,
          shadowOpacity: 0.28,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: size * 0.36,
          },
          textStyle,
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

/* ------------------------------------------------------------
   Hero — navy card with decorative orange glow + rings
------------------------------------------------------------ */
export const Hero = ({ children, style }) => (
  <View style={[styles.hero, style]}>
    <View pointerEvents="none" style={styles.heroGlow} />
    <View pointerEvents="none" style={styles.heroRingLg} />
    <View pointerEvents="none" style={styles.heroRingSm} />
    {children}
  </View>
);

/* ------------------------------------------------------------
   SectionTitle — accent bar + uppercase label
------------------------------------------------------------ */
export const SectionTitle = ({ children, style }) => (
  <View style={[styles.sectionRow, style]}>
    <View style={styles.sectionAccent} />
    <Text style={styles.sectionText}>{children}</Text>
  </View>
);

/* ------------------------------------------------------------
   Pill — small status chip
------------------------------------------------------------ */
export const Pill = ({
  children,
  color = C.primary,
  bg,
  icon,
  style,
}) => (
  <View
    style={[
      {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: bg || C.primarySoft,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
      },
      style,
    ]}
  >
    {icon ? (
      <MaterialIcons
        name={icon}
        size={12}
        color={color}
        style={{ marginRight: 4 }}
      />
    ) : null}
    <Text
      style={{
        color,
        fontSize: 12,
        fontWeight: '700',
      }}
    >
      {children}
    </Text>
  </View>
);

/* ------------------------------------------------------------
   PrimaryButton — orange glossy pill
------------------------------------------------------------ */
export const PrimaryButton = ({
  title,
  onPress,
  loading,
  disabled,
  icon,
  style,
  textStyle,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    disabled={disabled || loading}
    style={[
      C.primaryButton,
      (disabled || loading) && { opacity: 0.6 },
      style,
    ]}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <View style={styles.btnContent}>
        {icon ? (
          <MaterialIcons
            name={icon}
            size={18}
            color="#fff"
            style={{ marginRight: 8 }}
          />
        ) : null}
        <Text style={[styles.btnText, textStyle]}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

/* ------------------------------------------------------------
   OutlineButton — orange outline pill
------------------------------------------------------------ */
export const OutlineButton = ({
  title,
  onPress,
  icon,
  style,
  textStyle,
}) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onPress}
    style={[C.outlineButton, style]}
  >
    <View style={styles.btnContent}>
      {icon ? (
        <MaterialIcons
          name={icon}
          size={18}
          color={C.accent}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={[styles.outlineText, textStyle]}>{title}</Text>
    </View>
  </TouchableOpacity>
);

/* ------------------------------------------------------------
   StatCard — icon + value + label
------------------------------------------------------------ */
export const StatCard = ({
  icon,
  label,
  value,
  color = C.text,
  bg = C.primarySoft,
  style,
}) => (
  <View style={[styles.statCard, style]}>
    <View style={[styles.statIcon, { backgroundColor: bg }]}>
      <MaterialIcons name={icon} size={20} color={color} />
    </View>
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      style={[styles.statValue, { color }]}
    >
      {value}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ------------------------------------------------------------
   StackHeader — back button + title (+ optional subtitle/right)
------------------------------------------------------------ */
export const StackHeader = ({
  title,
  subtitle,
  onBack,
  right,
  style,
}) => (
  <View style={[styles.stackHeader, style]}>
    <TouchableOpacity
      onPress={onBack}
      style={styles.backBtn}
      activeOpacity={0.8}
    >
      <MaterialIcons name="arrow-back" size={22} color={C.primary} />
    </TouchableOpacity>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.stackTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.stackSub}>{subtitle}</Text>
      ) : null}
    </View>
    {right}
  </View>
);

const styles = StyleSheet.create({
  // Hero
  hero: {
    backgroundColor: C.primary,
    borderRadius: 26,
    padding: 20,
    overflow: 'hidden',
    ...C.shadow,
    shadowOpacity: 0.28,
  },
  heroGlow: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,106,0,0.32)',
  },
  heroRingLg: {
    position: 'absolute',
    bottom: -55,
    left: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 24,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  heroRingSm: {
    position: 'absolute',
    top: 26,
    left: 34,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  // Section title
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  sectionAccent: {
    width: 4,
    height: 15,
    borderRadius: 2,
    backgroundColor: C.accent,
  },
  sectionText: {
    color: C.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 8,
  },

  // Buttons
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.4,
  },
  outlineText: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Stat card
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    ...C.shadow,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 2,
  },

  // Stack header
  stackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...C.shadow,
  },
  stackTitle: {
    color: C.text,
    fontSize: 21,
    fontWeight: 'bold',
  },
  stackSub: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 1,
  },
});