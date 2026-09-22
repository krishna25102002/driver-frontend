import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resetDriverPassword } from '../../api';
import { useAlert } from '../../components/AlertProvider';
import { C } from '../../theme';
import { Hero, PrimaryButton, StackHeader } from '../../components/ui';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const alert = useAlert();
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp.trim()) {
      alert.warning('OTP required', 'Please enter the code from your email');
      return;
    }
    if (!newPassword) {
      alert.warning('Password required', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      alert.warning('Weak password', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert.warning('Passwords do not match', 'Please re-enter your new password');
      return;
    }

    setLoading(true);
    try {
      const res = await resetDriverPassword({ email, otp, newPassword });
      alert.success('Password reset', res.data?.message || 'You can now log in with your new password');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (err) {
      console.log('RESET PASSWORD ERR:', err.response?.data || err);
      alert.error('Reset failed', err.response?.data?.message || 'Please check your OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StackHeader
        title="Set New Password"
        subtitle={email}
        onBack={() => navigation.goBack()}
      />

      <Hero style={styles.hero}>
        <Text style={styles.heroTitle}>Almost done</Text>
        <Text style={styles.heroSub}>
          Enter the OTP sent to your email, then choose your new password.
        </Text>
      </Hero>

      <View style={styles.inputContainer}>
        <Icon name="security" size={20} color={C.accent} />
        <TextInput
          placeholder="OTP from email"
          placeholderTextColor={C.textMuted}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color={C.accent} />
        <TextInput
          placeholder="New password (min 6 chars)"
          placeholderTextColor={C.textMuted}
          secureTextEntry={!showPassword}
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacityLocal onPress={() => setShowPassword(s => !s)} show={showPassword} />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color={C.accent} />
        <TextInput
          placeholder="Confirm new password"
          placeholderTextColor={C.textMuted}
          secureTextEntry={!showPassword}
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <PrimaryButton
        title="Reset Password"
        icon="check"
        loading={loading}
        onPress={handleReset}
        style={styles.resetBtn}
      />
    </ScrollView>
  );
};

const TouchableOpacityLocal = ({ onPress, show }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Icon
      name={show ? 'visibility-off' : 'visibility'}
      size={20}
      color={C.textMuted}
    />
  </TouchableOpacity>
);

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 22,
    paddingTop: 60,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: 24,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    zIndex: 1,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 6,
    lineHeight: 20,
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },
  input: {
    flex: 1,
    color: C.text,
    marginLeft: 10,
    padding: 15,
  },
  resetBtn: {
    marginTop: 10,
    paddingVertical: 16,
  },
});