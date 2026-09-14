import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { copyFile, CachesDirectoryPath, stat } from '@dr.pogodin/react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadDocuments, describeError } from '../../api';
import { useNavigation } from '@react-navigation/native';
import { C } from '../../theme';
import { Hero, PrimaryButton } from '../../components/ui';

const DocCard = ({ label, image, onPick, icon }) => (
  <TouchableOpacity
    style={[styles.card, image && styles.cardFilled]}
    onPress={onPick}
    activeOpacity={0.8}
  >
    <View style={[styles.docIcon, image && styles.docIconFilled]}>
      <MaterialIcons name={icon || 'upload-file'} size={22} color={image ? C.success : C.primary} />
    </View>
    <View style={styles.cardTextWrap}>
      <Text style={styles.text}>{label}</Text>
      {!image && <Text style={styles.hint}>Tap to upload</Text>}
    </View>
    {image ? (
      <>
        <View style={styles.uploadedPill}>
          <MaterialIcons name="check-circle" size={16} color={C.success} />
          <Text style={styles.uploadedText}>Added</Text>
        </View>
        <Image source={{ uri: image.uri }} style={styles.thumb} />
      </>
    ) : (
      <View style={styles.uploadCircle}>
        <MaterialIcons name="add" size={22} color={C.accent} />
      </View>
    )}
  </TouchableOpacity>
);

const UploadDocumentsScreen = () => {
  const navigation = useNavigation();

  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [vehicleRc, setVehicleRc] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async setter => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.6,
    });

    if (result.didCancel) return;

    setter(result.assets[0]);
  };

  const toRealFile = async (file, name) => {
    if (!file) return null;
    const fileName = file.fileName || `${name}.jpg`;
    const isFileUri = /^file:/.test(file.uri);
    const cachePath = `${CachesDirectoryPath}/${fileName}`;

    let uri = file.uri;
    if (!isFileUri) {
      await copyFile(file.uri, cachePath);
      uri = `file://${cachePath}`;
    }

    return { uri, type: file.type || 'image/jpeg', name: fileName };
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

      setLoading(true);

      const files = [
        ['profilePhoto', profilePhoto],
        ['aadhaarFront', aadhaarFront],
        ['aadhaarBack', aadhaarBack],
        ['licenseFront', licenseFront],
        ['licenseBack', licenseBack],
        ['vehicleRc', vehicleRc],
      ];

      const realFiles = [];

      for (const [key, file] of files) {
        const realFile = await toRealFile(file, key);
        if (realFile) {
          const size = await stat(realFile.uri.replace(/^file:\/\//, ''))
            .then(s => s.size)
            .catch(() => '?');
          console.log('APPENDING FILE:', key, realFile.uri, `${size} bytes`);
          realFiles.push({ field: key, ...realFile });
        }
      }

      await uploadDocuments(realFiles);

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'PendingApproval' }],
      });
    } catch (err) {
      const detail = describeError(err);
      console.log('UPLOAD ERROR DETAIL:', JSON.stringify(detail, null, 2));
      setLoading(false);
      if (detail.kind === 'server-responded') {
        Alert.alert(
          `Error ${detail.status}`,
          detail.data?.message || 'Server rejected the upload'
        );
      } else {
        Alert.alert(
          'Upload failed',
          `${detail.message}\nCould not reach ${detail.baseURL}${detail.url}`
        );
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Hero style={styles.hero}>
        <Text style={styles.heroTitle}>Upload Documents</Text>
        <Text style={styles.heroSubtitle}>
          Aadhaar & driving license are mandatory • RC optional
        </Text>
      </Hero>

      <DocCard label="Profile photo" image={profilePhoto} onPick={() => pickImage(setProfilePhoto)} icon="person" />
      <DocCard label="Aadhaar front" image={aadhaarFront} onPick={() => pickImage(setAadhaarFront)} icon="badge" />
      <DocCard label="Aadhaar back" image={aadhaarBack} onPick={() => pickImage(setAadhaarBack)} icon="badge" />
      <DocCard label="Driving license front" image={licenseFront} onPick={() => pickImage(setLicenseFront)} icon="credit-card" />
      <DocCard label="Driving license back" image={licenseBack} onPick={() => pickImage(setLicenseBack)} icon="credit-card" />
      <DocCard label="Vehicle RC (optional)" image={vehicleRc} onPick={() => pickImage(setVehicleRc)} icon="directions-car" />

      <PrimaryButton
        title="Submit for Review"
        icon="verify"
        loading={loading}
        onPress={uploadFiles}
        style={styles.button}
      />
    </ScrollView>
  );
};

export default UploadDocumentsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 40 },

  backBtn: {
    alignSelf: 'flex-start',
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
    ...C.shadow,
  },
  backText: {
    color: C.accent,
    fontWeight: '700',
  },

  hero: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    zIndex: 1,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 5,
    zIndex: 1,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
    ...C.shadow,
  },
  cardFilled: {
    borderColor: C.success,
    borderStyle: 'solid',
    backgroundColor: C.successSoft,
  },

  docIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  docIconFilled: {
    backgroundColor: C.surface,
  },

  cardTextWrap: {
    flex: 1,
  },
  text: {
    color: C.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  hint: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },

  uploadedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  uploadedText: {
    color: C.success,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  thumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: C.surface,
  },

  uploadCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    marginTop: 24,
    paddingVertical: 16,
  },
});