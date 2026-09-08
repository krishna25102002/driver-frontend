import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { C } from '../theme';

const MyDocumentsScreen = () => {
  const documents = [
    { id: 1, title: 'Driving License', number: 'DL-1234-567890', status: 'Verified' },
    { id: 2, title: 'RC (Vehicle)', number: 'KA01AB1234', status: 'Pending' },
    { id: 3, title: 'Aadhaar Card', number: 'XXXX-XXXX-1234', status: 'Verified' },
    { id: 4, title: 'Insurance', number: 'INS-987654', status: 'Rejected' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified':
        return { bg: C.successSoft, fg: C.success, icon: 'verified' };
      case 'Pending':
        return { bg: C.primarySoft, fg: C.warning, icon: 'hourglass-empty' };
      case 'Rejected':
        return { bg: C.dangerSoft, fg: C.danger, icon: 'cancel' };
      default:
        return { bg: C.inputBg, fg: C.textMuted, icon: 'error-outline' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => { /* back handled by stack */ }} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Documents</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {documents.map((doc) => {
          const s = getStatusStyle(doc.status);
          return (
            <View key={doc.id} style={styles.card}>
              {/* Icon */}
              <View style={[styles.typeIcon, { backgroundColor: s.bg }]}>
                <MaterialIcons name="description" size={24} color={s.fg} />
              </View>

              {/* Details */}
              <View style={styles.details}>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docNumber}>{doc.number}</Text>
              </View>

              {/* Status */}
              <View style={[styles.status, { backgroundColor: s.bg }]}>
                <Text style={[styles.statusText, { color: s.fg }]}>{doc.status}</Text>
              </View>
            </View>
          );
        })}

        <TouchableOpacity style={styles.uploadBtn}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={styles.uploadText}>Upload New Document</Text>
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

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
  },

  typeIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  details: {
    flex: 1,
  },
  docTitle: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  docNumber: {
    color: C.textSub,
    marginVertical: 3,
    fontSize: 12,
  },

  status: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  uploadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.accent,
    padding: 15,
    borderRadius: 30,
    marginTop: 6,
    ...C.shadow,
    shadowOpacity: 0.25,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default MyDocumentsScreen;