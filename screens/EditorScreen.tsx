import React, { useState, useRef, useEffect, useCallback } from 'react';
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

import { EditorToolbar, SaveIndicator, TagBadge } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
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
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef(content);
  const tagsRef = useRef(tags);

  contentRef.current = content;
  tagsRef.current = tags;

  const saveNote = useCallback(() => {
    const c = contentRef.current.trim();
    const t = tagsRef.current;
    if (!c) return;

    setIsSaving(true);
    if (noteId && existingNote) {
      updateNote(noteId, { content: c, tags: t });
    } else {
      addNote({
        id: generateId(),
        content: c,
        tags: t,
        images: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inRecycleBin: false,
      });
    }
    setIsSaving(false);
    setSaved(true);
  }, [noteId, existingNote, addNote, updateNote]);

  // Auto-save with 5s debounce
  useEffect(() => {
    if (content !== (existingNote?.content ?? '')) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaved(false);
      saveTimerRef.current = setTimeout(saveNote, 5000);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [content, saveNote, existingNote?.content]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#+/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

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
        <TouchableOpacity onPress={saveNote} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.saveBtn, { color: colors.accentGreen }]}>
            {isSaving ? '儲存中...' : '儲存'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main text input */}
          <TextInput
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

          {/* Tags section */}
          <View style={[styles.tagsSection, { borderTopColor: colors.divider }]}>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <TouchableOpacity key={tag} onLongPress={() => handleRemoveTag(tag)}>
                  <TagBadge label={tag} variant="active" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Tag input */}
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.tagInput, { color: colors.textPrimary, borderColor: colors.border }]}
                value={tagInput}
                onChangeText={(text) => {
                  setTagInput(text);
                  setShowTagSuggestions(text.length > 0);
                }}
                onSubmitEditing={handleAddTag}
                placeholder="#新增標籤"
                placeholderTextColor={colors.placeholder}
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>

        {/* Toolbar */}
        <EditorToolbar
          onTagPress={() => setTagInput('#')}
          onImagePress={() => undefined}
        />
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
  tagsSection: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
});
