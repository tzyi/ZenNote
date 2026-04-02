import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  TouchableOpacity as RNGHTouchableOpacity,
} from 'react-native-gesture-handler';
// ── 使用 RN 原生 TouchableOpacity (在 GestureHandlerRootView 外) ──
import { TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../theme';
import { NoteImage } from '../models';
import { copyImageToPermanentStorage } from '../services/imageService';

interface ImageUploaderProps {
  images: NoteImage[];
  onImagesChange: (images: NoteImage[]) => void;
  maxImages?: number;
}

function generateImageId(): string {
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── ZoomableImage ────────────────────────────────────────────────────────────
// 支援：雙擊放大/還原、捏放縮放、放大後平移
interface ZoomableImageProps {
  uri: string;
}

function ZoomableImage({ uri }: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // ── 捏放縮放 ──────────────────────────────────────────────────────────────
  const pinchGesture = Gesture.Pinch()
    .onStart((e) => {
      'worklet';
      savedScale.value = scale.value;
      focalX.value = e.focalX;
      focalY.value = e.focalY;
    })
    .onUpdate((e) => {
      'worklet';
      const nextScale = Math.max(0.5, Math.min(savedScale.value * e.scale, 6));
      scale.value = nextScale;
    })
    .onEnd(() => {
      'worklet';
      if (scale.value < 1.05) {
        scale.value = withTiming(1, { duration: 200 });
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  // ── 放大後平移 ─────────────────────────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(2)
    .onStart(() => {
      'worklet';
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      'worklet';
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
      // scale == 1 時彈回原位
      if (scale.value <= 1.05) {
        translateX.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  // ── 雙擊切換 2.5× / 還原 ──────────────────────────────────────────────────
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd((_e, success) => {
      'worklet';
      if (!success) return;
      if (scale.value > 1.05) {
        scale.value = withTiming(1, { duration: 250 });
        translateX.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(0, { duration: 250 });
        savedScale.value = 1;
      } else {
        scale.value = withTiming(2.5, { duration: 300 });
        savedScale.value = 2.5;
      }
    });

  // 組合手勢：pinch + pan 同時進行，doubleTap 獨立辨識
  const pinchPan = Gesture.Simultaneous(pinchGesture, panGesture);
  const allGestures = Gesture.Simultaneous(doubleTapGesture, pinchPan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={allGestures}>
      <Animated.View
        style={[zoomStyles.container, animatedStyle]}
        // Android: 防止 View 被 layout 優化器移除（關鍵！）
        collapsable={false}
      >
        <Image
          source={{ uri }}
          style={zoomStyles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const zoomStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

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
      try {
        const newImages: NoteImage[] = await Promise.all(
          result.assets.map(async (asset, i) => {
            const permanentUri = await copyImageToPermanentStorage(asset.uri);
            return {
              id: generateImageId(),
              noteId: '',
              uri: permanentUri,
              order: images.length + i,
            };
          })
        );
        onImagesChange([...images, ...newImages]);
      } catch {
        Alert.alert('錯誤', '無法儲存圖片，請重試。');
      }
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
            const target = images.find((img) => img.id === imageId);
            const updated = images
              .filter((img) => img.id !== imageId)
              .map((img, idx) => ({ ...img, order: idx }));
            onImagesChange(updated);
            // 刪除永久目錄中的實體檔案（非同步，失敗不影響 UI）
            if (target?.uri && target.uri.includes('note_images')) {
              FileSystem.deleteAsync(target.uri, { idempotent: true }).catch(() => {});
            }
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
        <GestureHandlerRootView style={styles.previewOverlay}>
          {/* 關閉按鈕改用原生 TouchableOpacity，避免在 Modal 內失效 */}
          <TouchableOpacity
            style={styles.previewCloseBtn}
            onPress={() => setPreviewUri(null)}
            activeOpacity={0.7}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Text style={styles.previewCloseText}>✕</Text>
          </TouchableOpacity>
          {previewUri && <ZoomableImage uri={previewUri} />}
          <Text style={styles.previewHint}>雙擊放大 · 捏放縮放 · 拖曳平移</Text>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

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
    top: 24, // 更靠近螢幕頂端
    right: 16, // 更靠近右側
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  previewHint: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
