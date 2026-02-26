import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { SaveIndicator, TagInput, ImageUploader } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { NoteImage } from '../src/models';
import type { RootStackScreenProps } from '../src/navigation/types';

type RouteProps = RootStackScreenProps<'Editor'>['route'];

function generateId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function EditorScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const noteId = route.params?.noteId;

  const { notes, addNote, updateNote } = useNotesStore();
  const existingNote = noteId ? notes.find((n) => n.id === noteId) : undefined;

  const [content, setContent] = useState(existingNote?.content ?? '');
  const [tags, setTags] = useState<string[]>(existingNote?.tags ?? []);
  const [images, setImages] = useState<NoteImage[]>(existingNote?.images ?? []);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const inputRef = useRef<TextInput>(null);

  const saveNote = useCallback(() => {
    const c = content.trim();
    const t = tags;
    const imgs = images;
    if (!c) return;

    setIsSaving(true);
    if (noteId && existingNote) {
      updateNote(noteId, { content: c, tags: t, images: imgs });
    } else {
      addNote({
        id: generateId(),
        content: c,
        tags: t,
        images: imgs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inRecycleBin: false,
      });
    }
    setIsSaving(false);
    setSaved(true);
  }, [noteId, existingNote, addNote, updateNote, content, tags, images]);

  const handleClose = () => {
    saveNote();
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <SaveIndicator visible={saved} />
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.saveBtn, { color: colors.accentGreen }]}>
            {isSaving ? '儲存中...' : '儲存'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* KeyboardAvoidingView with hardware keyboard support (T030) */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Main text input */}
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { color: colors.textPrimary }]}
            value={content}
            onChangeText={setContent}
            multiline
            placeholder="記錄當下的想法..."
            placeholderTextColor={colors.placeholder}
            autoFocus={!noteId}
            textAlignVertical="top"
            selectionColor={colors.accentGreen}
          />

          {/* Image uploader section (T027) */}
          <View style={[styles.imageSection, { borderTopColor: colors.divider }]}>
            <ImageUploader
              images={images}
              onImagesChange={setImages}
            />
          </View>

          {/* Tags section using TagInput (T026) */}
          <View style={[styles.tagsSection, { borderTopColor: colors.divider }]}>
            <TagInput tags={tags} onTagsChange={setTags} />
          </View>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 26,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  imageSection: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  tagsSection: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
});
