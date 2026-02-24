import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useColors } from '../theme';
import { useTagsStore } from '../store';
import { TagBadge } from './TagBadge';

interface TagSelectorProps {
  selectedTags: string[];
  onSelectionChange: (tags: string[]) => void;
  maxVisible?: number;
}

export function TagSelector({
  selectedTags,
  onSelectionChange,
  maxVisible = 20,
}: TagSelectorProps) {
  const colors = useColors();
  const { tags: allTags } = useTagsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = useMemo(() => {
    let result = allTags;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = allTags.filter((t) => t.name.toLowerCase().includes(q));
    }
    return result.slice(0, maxVisible);
  }, [allTags, searchQuery, maxVisible]);

  const toggleTag = useCallback(
    (tagName: string) => {
      if (selectedTags.includes(tagName)) {
        onSelectionChange(selectedTags.filter((t) => t !== tagName));
      } else {
        onSelectionChange([...selectedTags, tagName]);
      }
    },
    [selectedTags, onSelectionChange]
  );

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View
        style={[
          styles.searchRow,
          { borderColor: colors.border, backgroundColor: colors.inputBackground },
        ]}
      >
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🏷</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜尋標籤..."
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearBtn, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <View style={[styles.selectedSection, { borderBottomColor: colors.divider }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            已選擇 ({selectedTags.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tagsRow}>
              {selectedTags.map((tag) => (
                <TouchableOpacity key={tag} onPress={() => toggleTag(tag)}>
                  <TagBadge label={tag} variant="active" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* All tags */}
      <View style={styles.allTagsSection}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          所有標籤 ({filteredTags.length})
        </Text>
        <View style={styles.tagsGrid}>
          {filteredTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.name)}
                style={[
                  styles.tagItem,
                  {
                    backgroundColor: isSelected ? colors.accentGreen : colors.surface,
                    borderColor: isSelected ? colors.accentGreen : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagName,
                    {
                      color: isSelected ? colors.textInverse : colors.textPrimary,
                    },
                  ]}
                >
                  #{tag.name}
                </Text>
                <Text
                  style={[
                    styles.tagCount,
                    {
                      color: isSelected ? colors.textInverse : colors.textMuted,
                    },
                  ]}
                >
                  {tag.noteCount}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredTags.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            {searchQuery ? '找不到符合的標籤' : '還沒有標籤'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: '600',
    paddingLeft: 8,
  },
  selectedSection: {
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  allTagsSection: {
    flex: 1,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  tagName: {
    fontSize: 13,
    fontWeight: '500',
  },
  tagCount: {
    fontSize: 11,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingTop: 20,
  },
});
