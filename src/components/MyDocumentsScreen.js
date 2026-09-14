import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getDocuments } from '../api';
import { C } from '../theme';
import { StackHeader, PrimaryButton, Pill } from './ui';

const MyDocumentsScreen = () => {
  const navigation = useNavigation();
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDocuments();
        setDocuments(res.data.documents);
      } catch (err) {
        console.log('DOCUMENTS ERR:', err.response?.data || err);
        setDocuments(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const docEntries = documents
    ? [
        { title: 'Driving License', file: documents.licenseFront || documents.licenseBack, icon: 'credit-card' },
        { title: 'Aadhaar Card', file: documents.aadhaarFront || documents.aadhaarBack, icon: 'badge' },
        { title: 'RC (Vehicle)', file: documents.vehicleRc, icon: 'directions-car' },
        { title: 'Profile photo', file: documents.profilePhoto, icon: 'person' },
      ].filter(d => d.file)
    : [];

  const status = documents?.status || 'Pending';
  const getStatusStyle = s => {
    switch (s) {
      case 'Approved':
        return { fg: C.success, bg: C.successSoft, icon: 'verified' };
      case 'Rejected':
        return { fg: C.danger, bg: C.dangerSoft, icon: 'cancel' };
      case 'Pending':
      default:
        return { fg: C.warning, bg: C.accentSoft, icon: 'hourglass-empty' };
    }
  };
  const s = getStatusStyle(status);

  const fileName = file => {
    if (!file) return '—';
    const parts = String(file).split(/[/\\]/);
    return parts[parts.length - 1] || '—';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StackHeader
          title="My Documents"
          subtitle="Verified documents for driving"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingBox}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <StackHeader
          title="My Documents"
          subtitle="Verified documents for driving"
          onBack={() => navigation.goBack()}
        />

        {documents ? (
          <>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, { backgroundColor: s.bg }]}>
                <MaterialIcons name={s.icon} size={26} color={s.fg} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.summaryTitle}>
                  {docEntries.length} document
                  {docEntries.length === 1 ? '' : 's'} uploaded
                </Text>
                <Text style={styles.summarySub}>
                  Status: {status}
                </Text>
              </View>
              <Pill color={s.fg} bg={s.bg} icon={s.icon}>
                {status}
              </Pill>
            </View>

            {docEntries.map((doc, idx) => (
              <View key={`${doc.title}-${idx}`} style={styles.card}>
                <View style={[styles.typeIcon, { backgroundColor: C.primarySoft }]}>
                  <MaterialIcons name={doc.icon} size={24} color={C.primary} />
                </View>

                <View style={styles.details}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docNumber} numberOfLines={1}>
                    {fileName(doc.file)}
                  </Text>
                </View>

                <Pill color={s.fg} bg={s.bg} icon={s.icon}>
                  {status}
                </Pill>
              </View>
            ))}

            <PrimaryButton
              title="Upload New Document"
              icon="add"
              onPress={() => navigation.navigate('UploadDocuments')}
              style={styles.uploadBtn}
            />
          </>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="folder-off" size={36} color={C.primary} />
            </View>
            <Text style={styles.emptyTitle}>No documents uploaded yet</Text>
            <Text style={styles.emptySub}>
              Upload your documents to get verified and start driving.
            </Text>
            <PrimaryButton
              title="Upload Documents"
              icon="upload"
              onPress={() => navigation.navigate('UploadDocuments')}
              style={styles.uploadBtn}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyDocumentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },

  loadingBox: {
    alignItems: 'center',
    marginTop: 60,
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primarySoft,
    borderWidth: 1,
    borderColor: C.primaryBorder,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  summarySub: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 2,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 12,
    ...C.shadow,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  details: {
    flex: 1,
    marginRight: 8,
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

  emptyCard: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 36,
    paddingHorizontal: 20,
    ...C.shadow,
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    color: C.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  uploadBtn: {
    marginTop: 18,
  },
});