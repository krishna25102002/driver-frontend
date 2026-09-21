import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAlert } from './AlertProvider';
import { C } from '../theme';
import { StackHeader, PrimaryButton } from './ui';

const HelpSupportScreen = () => {
  const navigation = useNavigation();
  const alert = useAlert();
  const [message, setMessage] = useState('');

  const faqs = [
    {
      question: 'How do I receive payments?',
      answer: 'Payments are transferred to your bank account weekly.',
    },
    {
      question: 'How to update documents?',
      answer: 'Go to Settings → My Documents → Edit & upload.',
    },
    {
      question: 'Trip not showing?',
      answer: 'Check your internet and ensure you are online.',
    },
  ];

  const callSupport = () => {
    Linking.openURL('tel:1800123456');
  };

  const emailSupport = () => {
    Linking.openURL('mailto:support@driverapp.com');
  };

  const submitIssue = () => {
    alert.success('Submitted', 'Our team will get back to you shortly.');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <StackHeader
          title="Help & Support"
          subtitle="We're here to help"
          onBack={() => navigation.goBack()}
        />

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>FAQs</Text>

        {faqs.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <View style={styles.faqQuestionRow}>
              <View style={styles.faqIcon}>
                <MaterialIcons name="help" size={16} color={C.accent} />
              </View>
              <Text style={styles.question}>{item.question}</Text>
            </View>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}

        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Contact support</Text>

        <TouchableOpacity style={styles.contactItem} onPress={callSupport} activeOpacity={0.8}>
          <View style={[styles.contactIcon, { backgroundColor: C.successSoft }]}>
            <MaterialIcons name="phone" size={22} color={C.success} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactText}>Call support</Text>
            <Text style={styles.contactSub}>1800-123-456 (toll free)</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={C.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={emailSupport} activeOpacity={0.8}>
          <View style={[styles.contactIcon, { backgroundColor: C.infoSoft }]}>
            <MaterialIcons name="email" size={22} color={C.info} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.contactText}>Email support</Text>
            <Text style={styles.contactSub}>support@driverapp.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={C.textMuted} />
        </TouchableOpacity>

        {/* Report Issue */}
        <Text style={styles.sectionTitle}>Report an issue</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Describe your issue..."
            placeholderTextColor={C.textMuted}
            multiline
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <PrimaryButton
          title="Submit"
          icon="send"
          onPress={submitIssue}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  sectionTitle: {
    color: C.primary,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontSize: 12,
    marginTop: 16,
    marginBottom: 10,
  },

  faqCard: {
    backgroundColor: C.surface,
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  question: {
    color: C.text,
    fontWeight: 'bold',
    flex: 1,
  },
  answer: {
    color: C.textSub,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    color: C.text,
    fontWeight: '700',
  },
  contactSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  inputBox: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    marginBottom: 14,
    ...C.shadow,
  },
  input: {
    color: C.text,
    minHeight: 96,
    textAlignVertical: 'top',
    padding: 6,
    fontSize: 14,
  },
});