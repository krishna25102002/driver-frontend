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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginDriver, setAuthToken } from '../../api';
import { useAlert } from '../../components/AlertProvider';
import { C } from '../../theme';
import { Hero, PrimaryButton, OutlineButton } from '../../components/ui';

const Login = () => {
  const navigation = useNavigation();
  const alert = useAlert();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      alert.warning('Missing details', 'Please enter phone number and password');
      return;
    }

    setLoading(true);
    try {
      const res = await loginDriver({ mobileNumber, password });

      const { token, driver } = res.data;

      if (!token) {
        alert.error('Login failed', res.data?.message || 'Please try again.');
        return;
      }

      await AsyncStorage.setItem('token', token);
      setAuthToken(token);

      if (driver && driver.verificationStatus === 'Approved') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        });
      } else if (driver && driver.verificationStatus === 'Rejected') {
        await AsyncStorage.removeItem('token');
        setAuthToken(null);
        alert.error('Application rejected', 'Your application was rejected by admin.');
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PendingApproval' }],
        });
      }
    } catch (err) {
      console.log('LOGIN ERR:', err.response?.data || err);
      alert.error('Login failed', err.response?.data?.message || 'Please try again.');
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
      {/* HERO BAND */}
      <Hero style={styles.hero}>
        <Text style={styles.logo}>
          Drive<Text style={styles.logoAccent}>Go</Text>
        </Text>
        <Text style={styles.partner}>Driver Partner</Text>
      </Hero>

      {/* TITLE */}
      <Text style={styles.welcome}>Welcome back,</Text>
      <Text style={styles.title}>Driver! 👋</Text>

      <Text style={styles.subtitle}>Sign in to manage your trips</Text>

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color={C.accent} />
        <TextInput
          placeholder="+91 98765 43210"
          placeholderTextColor={C.textMuted}
          style={styles.input}
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color={C.accent} />
        <TextInput
          placeholder="Password"
          placeholderTextColor={C.textMuted}
          secureTextEntry={!showPassword}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(s => !s)} activeOpacity={0.7}>
          <Icon
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={20}
            color={C.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <PrimaryButton
        title="Login"
        icon="login"
        loading={loading}
        onPress={handleLogin}
        style={styles.loginBtn}
      />

      {/* Register */}
      <Text style={styles.newDriver}>New driver?</Text>

      <OutlineButton
        title="Register as Driver"
        icon="person-add"
        onPress={() => navigation.navigate('Register')}
      />
    </ScrollView>
  );
};

export default Login;

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
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 28,
  },
  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    zIndex: 1,
  },
  logoAccent: {
    color: '#FFD9BC',
  },
  partner: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    zIndex: 1,
    marginTop: 2,
  },

  welcome: {
    color: C.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: C.text,
    marginTop: 4,
  },
  subtitle: {
    color: C.textSub,
    marginTop: 6,
    marginBottom: 22,
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
  forgot: {
    color: C.accent,
    textAlign: 'right',
    marginVertical: 12,
    fontWeight: '700',
  },

  loginBtn: {
    marginTop: 6,
    paddingVertical: 16,
  },
  newDriver: {
    textAlign: 'center',
    color: C.textMuted,
    marginVertical: 18,
  },
});