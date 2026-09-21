import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { C } from '../theme';

// Animated skip-balance banner. Shows used/limit (e.g. "2/3") with a
// pulsing icon + growing progress bar so the driver can see at a glance
// how many skips remain before the next request MUST be accepted.
const SkipCounterBanner = ({ strikes, remaining, limit, forced }) => {
  const pulse = React.useRef(new Animated.Value(0)).current;
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const current = Number(strikes) || 0;
  const total = Number(limit) || 3;
  const left = Number(remaining) || Math.max(Math.min(total - current, total - 1), 0);
  const isForced = Boolean(forced) && current >= Math.max(total - 1, 0);
  const ratio = total > 0 ? Math.min(current / total, 1) : 0;

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });
  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  return (
    <View style={[styles.banner, isForced && styles.bannerForced]}>
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: isForced ? C.danger : C.warning,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
      <View style={styles.body}>
        <Text style={[styles.title, isForced && styles.titleForced]}>
          Skip balance {current}/{total}
        </Text>
        <Text style={styles.sub}>
          {isForced
            ? 'Accept required on the next request'
            : left > 0
              ? `${left} more skip${left === 1 ? '' : 's'} left — then the next request must be accepted`
              : 'Accept required on the next request'}
        </Text>
        <View
          style={styles.track}
          onLayout={e => setWidth(e.nativeEvent.layout.width)}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                width: width ? width * ratio : 0,
                backgroundColor: isForced ? C.danger : C.warning,
              },
            ]}
          />
        </View>
      </View>
      <Text style={[styles.count, isForced && styles.countForced]}>
        {current}/{total}
      </Text>
    </View>
  );
};

export default SkipCounterBanner;

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#FFE3B3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bannerForced: {
    backgroundColor: C.dangerSoft,
    borderColor: '#FABDBD',
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  body: {
    flex: 1,
  },
  title: {
    color: '#8A5A00',
    fontWeight: 'bold',
    fontSize: 13,
  },
  titleForced: {
    color: C.danger,
  },
  sub: {
    color: C.textSub,
    fontSize: 11,
    marginTop: 2,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginTop: 6,
  },
  fill: {
    height: 5,
    borderRadius: 3,
  },
  count: {
    color: '#8A5A00',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 10,
    fontVariant: ['tabular-nums'],
  },
  countForced: {
    color: C.danger,
  },
});