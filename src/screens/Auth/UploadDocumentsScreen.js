import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Image,
  ActivityIndicator, Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadDocuments, setAuthToken } from '../../api';
import { useNavigation, useRoute } from '@react-navigation/native';
import { C } from '../../theme';

const UploadDocumentsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [vehicleRc, setVehicleRc] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setter) => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (result.didCancel) return;

    setter(result.assets[0]);
  };

  const toFile = (file, name) => {
    if (!file) return null;
    return {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `${name}.jpg`,
    };
  };

  const uploadFiles = async () => {
    try {
      if (!aadhaarFront) {
        Alert.alert('Error', 'Please upload Aadhaar Front');
        return;
      }
      if (!licenseFront) {
        Alert.alert('Error', 'Please upload Driving License Front');
        return;
      }
      if (!vehicleRc) {
        Alert.alert('Error', 'Please upload RC');
        return;
      }

      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        setLoading(false);
        return;
      }

      setAuthToken(token);

      const formData = new FormData();

      if (profilePhoto) formData.append('profilePhoto', toFile(profilePhoto, 'profilePhoto'));
      if (aadhaarFront) formData.append('aadhaarFront', toFile(aadhaarFront, 'aadhaarFront'));
      if (aadhaarBack) formData.append('aadhaarBack', toFile(aadhaarBack, 'aadhaarBack'));
      if (licenseFront) formData.append('licenseFront', toFile(licenseFront, 'licenseFront'));
      if (licenseBack) formData.append('licenseBack', toFile(licenseBack, 'licenseBack'));
      if (vehicleRc) formData.append('vehicleRc', toFile(vehicleRc, 'vehicleRc'));

      await uploadDocuments(formData);

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PendingApproval' }],
      });
    } catch (err) {
      console.log('UPLOAD ERROR:', err.response?.data || err);
      setLoading(false);
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    }
  };

  const DocCard = ({ label, image, onPick, icon }) => (
    <TouchableOpacity style={[styles.card, image && styles.cardFilled]} onPress={onPick} activeOpacity={0.8}>
      <View style={styles.docIcon}>
        <MaterialIcons name={icon || 'upload-file'} size={22} color={image ? C.success : C.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.text}>{label}</Text>
        {!image && <Text style={styles.hint}>Tap to upload</Text>}
      </View>
      {image && (
        <View style={styles.uploadedPill}>
          <MaterialIcons name="check-circle" size={16} color={C.success} />
          <Text style={styles.uploadedText}>Added</Text>
        </View>
      )}
      {image && <Image source={{ uri: image.uri }} style={styles.thumb} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Upload Documents</Text>
        <Text style={styles.heroSubtitle}>Aadhaar & driving license are mandatory</Text>
      </View>

      <DocCard label="Profile Photo" image={profilePhoto} onPick={() => pickImage(setProfilePhoto)} icon="person" />
      <DocCard label="Aadhaar Front" image={aadhaarFront} onPick={() => pickImage(setAadhaarFront)} icon="badge" />
      <DocCard label="Aadhaar Back" image={aadhaarBack} onPick={() => pickImage(setAadhaarBack)} icon="badge" />
      <DocCard label="Driving License Front" image={licenseFront} onPick={() => pickImage(setLicenseFront)} icon="credit-card" />
      <DocCard label="Driving License Back" image={licenseBack} onPick={() => pickImage(setLicenseBack)} icon="credit-card" />
      <DocCard label="Vehicle RC" image={vehicleRc} onPick={() => pickImage(setVehicleRc)} icon="directions-car" />

      <TouchableOpacity style={styles.button} onPress={uploadFiles}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Submit</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default UploadDocumentsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20 },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  backText: {
    color: C.accent,
    fontWeight: '600',
  },

  hero: {
    backgroundColor: C.primary,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
    ...C.shadow,
    shadowOpacity: 0.22,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 4,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  cardFilled: {
    borderColor: C.success,
    borderStyle: 'solid',
    backgroundColor: C.successSoft,
  },

  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  text: { color: C.text, fontWeight: 'bold', fontSize: 14 },

  hint: { color: C.textMuted, fontSize: 12, marginTop: 2 },

  uploadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  uploadedText: { color: C.success, fontSize: 11, fontWeight: '600', marginLeft: 4 },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },

  button: {
    backgroundColor: C.accent,
    padding: 16,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    ...C.shadow,
    shadowOpacity: 0.28,
  },

  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});