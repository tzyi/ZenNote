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

import { SaveIndicator, TagInput, ImageUploader, MarkdownPreview } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { NoteImage } from '../src/models';
import type { RootStackScreenProps } from '../src/navigation/types';

type RouteProps = RootStackScreenProps<'Editor'>['route'];
type EditorMode = 'edit' | 'preview';

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
  const [mode, setMode] = useState<EditorMode>('edit');

  const inputRef = useRef<TextInput>(null);

  /** Insert markdown syntax at cursor / wrap selection */
  const insertMarkdown = useCallback(
    (prefix: string, suffix = '') => {
      // Simple append strategy – works reliably on both platforms
      setContent((prev) => `${prev}${prefix}${suffix}`);
      // Switch to edit mode if in preview
      setMode('edit');
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    [],
  );

  const handleSave = useCallback(() => {
    const c = content.trim();
    if (!c) return;

    setIsSaving(true);
    if (noteId && existingNote) {
      updateNote(noteId, { content: c, tags, images });
    } else {
      addNote({
        id: generateId(),
        content: c,
        tags,
        images,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inRecycleBin: false,
      });
    }
    setIsSaving(false);
    setSaved(true);
    navigation.goBack();
  }, [content, tags, images, noteId, existingNote, addNote, updateNote, navigation]);

  const handleClose = () => {
    navigation.goBack();
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'edit' ? 'preview' : 'edit'));
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}> 
        {/* 左側：關閉按鈕 */}
        <View style={styles.headerSide}>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.closeBtn, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* 中間：模式切換按鈕 */}
        <View style={styles.headerCenter}>
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              onPress={toggleMode}
              style={[
                styles.modeToggleBtn,
                {
                  backgroundColor:
                    mode === 'preview' ? colors.accentGreen : colors.surfaceVariant,
                },
              ]}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.modeToggleText,
                  {
                    color: mode === 'preview' ? colors.textInverse : colors.textSecondary,
                  },
                ]}
              >
                {mode === 'edit' ? '預覽' : '編輯'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 右側：儲存按鈕與指示 */}
        <View style={styles.headerSide}>
          <SaveIndicator visible={saved} />
          <TouchableOpacity
            onPress={handleSave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.saveBtn, { color: colors.accentGreen }]}>
              {isSaving ? '儲存中...' : '儲存'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Markdown toolbar – only visible in edit mode */}
      {mode === 'edit' && (
        <View style={[styles.mdToolbar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mdToolbarContent}
          >
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('# ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>H1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('## ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>H2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('### ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>H3</Text>
            </TouchableOpacity>
            <View style={[styles.mdSeparator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('**', '**')}>
              <Text style={[styles.mdBtnText, { color: colors.icon, fontWeight: '700' }]}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('*', '*')}>
              <Text style={[styles.mdBtnText, { color: colors.icon, fontStyle: 'italic' }]}>I</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('~~', '~~')}>
              <Text style={[styles.mdBtnText, { color: colors.icon, textDecorationLine: 'line-through' }]}>S</Text>
            </TouchableOpacity>
            <View style={[styles.mdSeparator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('- ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>• List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('1. ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>1. List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('- [ ] ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>☐</Text>
            </TouchableOpacity>
            <View style={[styles.mdSeparator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('> ')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>❝</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('`', '`')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>&lt;/&gt;</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('\n```\n', '\n```\n')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('\n---\n')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>—</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mdBtn} onPress={() => insertMarkdown('[', '](url)')}>
              <Text style={[styles.mdBtnText, { color: colors.icon }]}>🔗</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Content Area */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        {mode === 'edit' ? (
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
              placeholder="使用 Markdown 記錄你的想法..."
              placeholderTextColor={colors.placeholder}
              autoFocus={!noteId}
              textAlignVertical="top"
              selectionColor={colors.accentGreen}
            />

            {/* Image uploader section (T027) */}
            <View style={[styles.imageSection, { borderTopColor: colors.divider }]}>
              <ImageUploader images={images} onImagesChange={setImages} />
            </View>

            {/* Tags section using TagInput (T026) */}
            <View style={[styles.tagsSection, { borderTopColor: colors.divider }]}>
              <TagInput tags={tags} onTagsChange={setTags} />
            </View>
          </ScrollView>
        ) : (
          /* Preview Mode */
          <View style={styles.flex}>
            <MarkdownPreview content={content} />

            {/* Show tags & images below preview as well */}
            {(tags.length > 0 || images.length > 0) && (
              <View
                style={[
                  styles.previewMeta,
                  { borderTopColor: colors.divider, backgroundColor: colors.background },
                ]}
              >
                {images.length > 0 && (
                  <View style={styles.imageSection}>
                    <ImageUploader images={images} onImagesChange={setImages} />
                  </View>
                )}
                {tags.length > 0 && (
                  <View style={[styles.tagsSection, { borderTopColor: colors.divider }]}>
                    <TagInput tags={tags} onTagsChange={setTags} />
                  </View>
                )}
              </View>
            )}
          </View>
        )}
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
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    minWidth: 80,
    gap: 8,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  closeBtn: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveBtn: {
    fontSize: 15,
    fontWeight: '600',
  },
  /* Mode toggle */
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  modeToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  /* Markdown toolbar */
  mdToolbar: {
    borderBottomWidth: 1,
    paddingVertical: 4,
  },
  mdToolbarContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  mdBtn: {
    minWidth: 36,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    paddingHorizontal: 8,
  },
  mdBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  mdSeparator: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
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
  previewMeta: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
