import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { C } from '../theme';

const BankDetailsScreen = () => {
  const bankDetails = {
    accountHolder: 'Arjun Kumar',
    bankName: 'HDFC Bank',
    accountNumber: '123456789012',
    ifsc: 'HDFC0001234',
  };

  const maskAccount = (acc) => {
    return 'XXXXXX' + acc.slice(-4);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { /* back handled by stack */ }} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bank Details</Text>
      </View>

      {/* Bank Card */}
      <View style={styles.bankCard}>
        <View style={styles.bankHeader}>
          <View style={styles.bankIcon}>
            <MaterialIcons name="account-balance" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.bankName}>{bankDetails.bankName}</Text>
            <Text style={styles.bankTag}>Primary Account</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Row icon="person" label="Account Holder" value={bankDetails.accountHolder} />
        <Row icon="credit-card" label="Account Number" value={maskAccount(bankDetails.accountNumber)} last />
        <Row icon="vpn-key" label="IFSC Code" value={bankDetails.ifsc} />
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.editBtn}>
        <Text style={styles.editText}>Edit Details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addBtn}>
        <MaterialIcons name="add" size={20} color={C.primary} />
        <Text style={styles.addText}>Add New Account</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const Row = ({ icon, label, value, last }) => (
  <View style={[styles.row, !last && styles.rowBorder]}>
    <View style={styles.left}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={18} color={C.primary} />
      </View>
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>

    <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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

  // Bank Card
  bankCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },

  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankName: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 17,
  },
  bankTag: {
    color: C.textSub,
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: C.textSub,
    fontSize: 12,
  },
  value: {
    color: C.text,
    fontSize: 15,
    marginTop: 2,
    fontWeight: '600',
  },

  // Buttons
  editBtn: {
    backgroundColor: C.accent,
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 20,
    ...C.shadow,
    shadowOpacity: 0.28,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  addBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.accent,
    padding: 15,
    borderRadius: 30,
    backgroundColor: C.surface,
  },
  addText: {
    color: C.accent,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default BankDetailsScreen;