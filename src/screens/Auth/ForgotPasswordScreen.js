import React, { useState } from 'react';
import {
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { forgotDriverPassword } from '../../api';
import { useAlert } from '../../components/AlertProvider';
import { FadeInUp } from '../../components/Animations';
import { C } from '../../theme';
import { Hero, PrimaryButton, StackHeader } from '../../components/ui';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const alert = useAlert();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      alert.warning('Email required', 'Please enter your registered email address');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotDriverPassword({ email });
      alert.success('OTP sent', res.data?.message || 'Check your inbox for the verification OTP');
      navigation.navigate('ResetPassword', { email: email.trim() });
    } catch (err) {
      console.log('FORGOT PASSWORD ERR:', err.response?.data || err);
      alert.error('Failed to send OTP', err.response?.data?.message || 'Please try again.');
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
      <FadeInUp>
        <StackHeader
          title="Forgot Password"
          subtitle="Reset your DriveGo driver password"
          onBack={() => navigation.goBack()}
        />
      </FadeInUp>

      <FadeInUp delay={80}>
        <Hero style={styles.hero}>
          <Text style={styles.heroTitle}>Account recovery</Text>
          <Text style={styles.heroSub}>
            We'll email a one-time verification code to your registered address so
            you can set a new password.
          </Text>
        </Hero>
      </FadeInUp>

      <FadeInUp delay={160} style={styles.inputContainer}>
        <Icon name="email" size={20} color={C.accent} />
        <TextInput
          placeholder="Registered email address"
          placeholderTextColor={C.textMuted}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
      </FadeInUp>

      <FadeInUp delay={230}>
        <PrimaryButton
          title="Send OTP"
          icon="mail"
          loading={loading}
          onPress={handleSend}
          style={styles.sendBtn}
        />
      </FadeInUp>
    </ScrollView>
  );
};

export default ForgotPasswordScreen;

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
  sendBtn: {
    marginTop: 10,
    paddingVertical: 16,
  },
});