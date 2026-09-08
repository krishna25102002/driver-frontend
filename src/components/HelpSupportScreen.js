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
import { C } from '../theme';

const HelpSupportScreen = () => {
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
    alert('Issue submitted!');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { /* back handled by stack */ }} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>FAQs</Text>

        {faqs.map((item, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer}</Text>
          </View>
        ))}

        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Contact Support</Text>

        <TouchableOpacity style={styles.contactItem} onPress={callSupport}>
          <View style={styles.contactIcon}>
            <MaterialIcons name="phone" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactText}>Call Support</Text>
            <Text style={styles.contactSub}>1800-123-456 (toll free)</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={C.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={emailSupport}>
          <View style={styles.contactIcon}>
            <MaterialIcons name="email" size={22} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactText}>Email Support</Text>
            <Text style={styles.contactSub}>support@driverapp.com</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={C.textMuted} />
        </TouchableOpacity>

        {/* Report Issue */}
        <Text style={styles.sectionTitle}>Report an Issue</Text>

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

        <TouchableOpacity style={styles.submitBtn} onPress={submitIssue}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 15,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backBtn: {
    marginRight: 10,
    padding: 4,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: C.text,
    fontSize: 22,
    fontWeight: 'bold',
  },

  sectionTitle: {
    color: C.primary,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 1,
    fontSize: 13,
  },

  // FAQ
  faqCard: {
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  question: {
    color: C.text,
    fontWeight: 'bold',
  },
  answer: {
    color: C.textSub,
    marginTop: 5,
    fontSize: 13,
  },

  // Contact
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactText: {
    color: C.text,
    fontWeight: '600',
  },
  contactSub: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  // Input
  inputBox: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 10,
    marginBottom: 10,
  },
  input: {
    color: C.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // Button
  submitBtn: {
    backgroundColor: C.accent,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    ...C.shadow,
    shadowOpacity: 0.28,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default HelpSupportScreen;