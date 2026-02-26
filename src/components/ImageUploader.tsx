import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useColors } from '../theme';
import { NoteImage } from '../models';

interface ImageUploaderProps {
  images: NoteImage[];
  onImagesChange: (images: NoteImage[]) => void;
  maxImages?: number;
}

function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const colors = useColors();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleAddImage = useCallback(async () => {
    if (images.length >= maxImages) {
      Alert.alert('圖片上限', `每篇筆記最多 ${maxImages} 張圖片`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '請在設定中允許存取相簿才能選擇圖片。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: maxImages - images.length,
    });

    if (!result.canceled) {
      const newImages: NoteImage[] = result.assets.map((asset, i) => ({
        id: generateImageId(),
        noteId: '',
        uri: asset.uri,
        order: images.length + i,
      }));
      onImagesChange([...images, ...newImages]);
    }
  }, [images, maxImages, onImagesChange]);

  const handleRemoveImage = useCallback(
    (imageId: string) => {
      Alert.alert('刪除圖片', '確定要刪除此圖片嗎？', [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: () => {
            const updated = images
              .filter((img) => img.id !== imageId)
              .map((img, idx) => ({ ...img, order: idx }));
            onImagesChange(updated);
          },
        },
      ]);
    },
    [images, onImagesChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textMuted }]}>
          圖片 ({images.length}/{maxImages})
        </Text>
        <TouchableOpacity
          onPress={handleAddImage}
          style={[styles.addBtn, { backgroundColor: colors.accentGreen }]}
        >
          <Text style={[styles.addBtnText, { color: colors.textInverse }]}>+ 新增</Text>
        </TouchableOpacity>
      </View>

      {images.length > 0 && (
        <View style={styles.imageGrid}>
          {images.map((item, index) => (
            <View key={item.id} style={styles.imageItem}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setPreviewUri(item.uri)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={[styles.thumbnail, { borderColor: colors.border }]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemoveImage(item.id)}
                style={[styles.removeBtn, { backgroundColor: colors.accentRed }]}
              >
                <Text style={[styles.removeBtnText, { color: colors.textInverse }]}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Full-screen image preview modal */}
      <Modal
        visible={previewUri !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewUri(null)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.previewCloseText}>✕</Text>
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_COLUMNS = 4;
const IMAGE_GAP = 8;
const IMAGE_SIZE = (SCREEN_WIDTH - 32 - IMAGE_GAP * (IMAGE_COLUMNS - 1)) / IMAGE_COLUMNS;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: IMAGE_GAP,
  },
  imageItem: {
    position: 'relative',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  thumbnail: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    borderWidth: 1,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  previewImage: {
    width: SCREEN_WIDTH - 32,
    height: '80%',
  },
});
