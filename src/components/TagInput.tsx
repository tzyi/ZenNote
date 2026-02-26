import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useColors } from '../theme';
import { useTagsStore } from '../store';
import { TagBadge } from './TagBadge';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = '#新增標籤',
}: TagInputProps) {
  const colors = useColors();
  const { tags: allTags, addTag } = useTagsStore();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    const query = input.replace(/^#+/, '').toLowerCase();
    if (!query) return [];
    return allTags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) &&
          !tags.includes(t.name)
      )
      .slice(0, 8);
  }, [input, allTags, tags]);

  const handleAddTag = useCallback(
    (tagName: string) => {
      const trimmed = tagName.trim().replace(/^#+/, '');
      if (trimmed && !tags.includes(trimmed)) {
        onTagsChange([...tags, trimmed]);

        // Auto-create tag in store if it doesn't exist
        const exists = allTags.some(
          (t) => t.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (!exists) {
          addTag({
            id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: trimmed,
            noteCount: 1,
            order: allTags.length,
          });
        }
      }
      setInput('');
      setShowSuggestions(false);
    },
    [tags, onTagsChange, allTags, addTag]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      onTagsChange(tags.filter((t) => t !== tag));
    },
    [tags, onTagsChange]
  );

  const handleSubmit = useCallback(() => {
    handleAddTag(input);
  }, [input, handleAddTag]);

  return (
    <View style={styles.container}>
      {/* Current tags */}
      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => handleRemoveTag(tag)}
            activeOpacity={0.7}
          >
            <TagBadge label={tag} variant="active" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              borderColor: showSuggestions ? colors.accentGreen : colors.border,
              backgroundColor: colors.inputBackground,
            },
          ]}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setShowSuggestions(text.replace(/^#+/, '').trim().length > 0);
          }}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          returnKeyType="done"
          autoCapitalize="none"
        />
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {suggestions.map((tag) => (
            <TouchableOpacity
              key={tag.id}
              onPress={() => handleAddTag(tag.name)}
              style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
            >
              <Text style={[styles.suggestionText, { color: colors.accentGreen }]}>
                #{tag.name}
              </Text>
              <Text style={[styles.suggestionCount, { color: colors.textMuted }]}>
                {tag.noteCount} 篇
              </Text>
            </TouchableOpacity>
          ))}
          {/* Create new tag option */}
          {input.replace(/^#+/, '').trim() &&
            !suggestions.some(
              (t) =>
                t.name.toLowerCase() ===
                input.replace(/^#+/, '').trim().toLowerCase()
            ) && (
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
              >
                <Text style={[styles.createText, { color: colors.accentBlue }]}>
                  + 建立「{input.replace(/^#+/, '').trim()}」
                </Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    maxHeight: 240,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
  },
  createText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
