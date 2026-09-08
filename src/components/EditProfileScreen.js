import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { C } from '../theme';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('Arjun Kumar');
  const [phone, setPhone] = useState('9876543210');
  const [image, setImage] = useState(null);

  const handlePickImage = () => {
    Alert.alert('Upload Photo', 'Image picker integration needed');
  };

  const handleSave = () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Profile updated!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Arrow */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      {/* Profile Image */}
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={handlePickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="person" size={44} color="#fff" />
            </View>
          )}

          <View style={styles.cameraIcon}>
            <MaterialIcons name="camera-alt" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={styles.changePhoto}>Change Photo</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputBox}>
          <MaterialIcons name="person" size={20} color={C.primary} />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={C.textMuted}
          />
        </View>

        <Text style={styles.label}>Mobile Number</Text>
        <View style={styles.inputBox}>
          <MaterialIcons name="phone" size={20} color={C.primary} />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Enter phone"
            placeholderTextColor={C.textMuted}
          />
        </View>
      </View>

      {/* Vehicle Info Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleIcon}>
          <MaterialIcons name="directions-car" size={22} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vehicleTitle}>Vehicle</Text>
          <Text style={styles.vehicleSub}>Sedan • KA01 AB 1234</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

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

  imageSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: C.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...C.shadow,
    shadowOpacity: 0.3,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: C.text,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: C.surface,
  },
  changePhoto: {
    color: C.accent,
    marginTop: 8,
    fontWeight: '600',
  },

  form: {
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  label: {
    color: C.textSub,
    marginBottom: 6,
    marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    color: C.text,
    padding: 12,
  },

  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primarySoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.primaryBorder,
    padding: 14,
    marginTop: 16,
  },
  vehicleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleTitle: {
    color: C.text,
    fontWeight: 'bold',
  },
  vehicleSub: {
    color: C.textSub,
    fontSize: 12,
    marginTop: 2,
  },

  saveBtn: {
    backgroundColor: C.accent,
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 24,
    ...C.shadow,
    shadowOpacity: 0.28,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;