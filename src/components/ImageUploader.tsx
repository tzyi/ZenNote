import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  FlatList,
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
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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

  const handleMoveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= images.length) return;
      const updated = [...images];
      const [moved] = updated.splice(fromIndex, 1);
      if (moved) {
        updated.splice(toIndex, 0, moved);
        onImagesChange(updated.map((img, idx) => ({ ...img, order: idx })));
      }
    },
    [images, onImagesChange]
  );

  const renderImageItem = useCallback(
    ({ item, index }: { item: NoteImage; index: number }) => (
      <View style={styles.imageItem}>
        <Image
          source={{ uri: item.uri }}
          style={[styles.thumbnail, { borderColor: colors.border }]}
          resizeMode="cover"
        />
        <View style={styles.imageActions}>
          {index > 0 && (
            <TouchableOpacity
              onPress={() => handleMoveImage(index, index - 1)}
              style={[styles.moveBtn, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.moveBtnText, { color: colors.icon }]}>◀</Text>
            </TouchableOpacity>
          )}
          {index < images.length - 1 && (
            <TouchableOpacity
              onPress={() => handleMoveImage(index, index + 1)}
              style={[styles.moveBtn, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.moveBtnText, { color: colors.icon }]}>▶</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleRemoveImage(item.id)}
            style={[styles.removeBtn, { backgroundColor: colors.accentRed }]}
          >
            <Text style={[styles.removeBtnText, { color: colors.textInverse }]}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.orderLabel, { color: colors.textMuted }]}>
          {index + 1}/{images.length}
        </Text>
      </View>
    ),
    [colors, images.length, handleMoveImage, handleRemoveImage]
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
        <FlatList
          horizontal
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageList}
        />
      )}
    </View>
  );
}

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
  imageList: {
    gap: 8,
  },
  imageItem: {
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageActions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  moveBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveBtnText: {
    fontSize: 10,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
