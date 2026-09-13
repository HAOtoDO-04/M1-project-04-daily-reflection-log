import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS } from '../style';

export default function PhotoPicker({ photoUri, onSelectPhoto, onRemovePhoto }) {

  const pickImageFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need photo library permissions to upload an image to your journal.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSelectPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take a new picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSelectPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo with camera:', error);
      Alert.alert('Error', 'Failed to capture photo with camera.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo Memory (Optional)</Text>

      {photoUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
          <View style={styles.actionOverlay}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.replaceButton}
              onPress={pickImageFromLibrary}
            >
              <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Replace</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.removeButton}
              onPress={onRemovePhoto}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.pickerButton}
            onPress={pickImageFromLibrary}
          >
            <Ionicons name="images-outline" size={24} color={COLORS.primary} />
            <Text style={styles.pickerButtonText}>Choose Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.pickerButton}
            onPress={takePhotoWithCamera}
          >
            <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
            <Text style={styles.pickerButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.cardBg,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#D8E2DC',
  },
  pickerButtonText: {
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  previewWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: SPACING.xs,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  actionOverlay: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 90, 64, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 57, 70, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
