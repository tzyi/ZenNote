import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SearchBar, FilterChips, FilterChip, Card, TagSelector, DatePicker } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { Note } from '../src/models';
import type { RootStackNavigationProp } from '../src/navigation/types';

type LogicMode = 'AND' | 'OR';

const FILTER_CHIPS: FilterChip[] = [
  { id: 'has-image', label: '有圖片', icon: '🖼' },
  { id: 'has-tag', label: '有標籤', icon: '🏷' },
  { id: 'pinned', label: '已置頂', icon: '📌' },
  { id: 'by-tag', label: '按標籤', icon: '#' },
  { id: 'by-date', label: '按日期', icon: '📅' },
];

function searchNotes(
  notes: Note[],
  query: string,
  activeChips: string[],
  logicMode: LogicMode,
  selectedTags: string[],
  dateRange: { from?: number; to?: number }
): Note[] {
  let result = notes.filter((n) => !n.inRecycleBin);

  // Chip filters (T033)
  if (activeChips.includes('has-image')) {
    result = result.filter((n) => n.images.length > 0);
  }
  if (activeChips.includes('has-tag')) {
    result = result.filter((n) => n.tags.length > 0);
  }
  if (activeChips.includes('pinned')) {
    result = result.filter((n) => n.isPinned);
  }

  // Tag filter (T035)
  if (selectedTags.length > 0) {
    result = result.filter((n) =>
      logicMode === 'AND'
        ? selectedTags.every((t) => n.tags.includes(t))
        : selectedTags.some((t) => n.tags.includes(t))
    );
  }

  // Date range filter (T036)
  if (dateRange.from) {
    result = result.filter((n) => n.createdAt >= dateRange.from!);
  }
  if (dateRange.to) {
    result = result.filter((n) => n.createdAt <= dateRange.to!);
  }

  // Text search with AND/OR (T034)
  if (!query.trim()) return result;

  const keywords = query.trim().toLowerCase().split(/\s+/);

  return result.filter((n) => {
    const text = `${n.content} ${n.tags.join(' ')}`.toLowerCase();
    if (logicMode === 'AND') {
      return keywords.every((kw) => text.includes(kw));
    }
    return keywords.some((kw) => text.includes(kw));
  });
}

export default function SearchScreen() {
  const colors = useColors();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notes } = useNotesStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [logicMode, setLogicMode] = useState<LogicMode>('AND');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: number; to?: number }>({});

  const hasActiveFilter =
    debouncedQuery.length > 0 || activeChips.length > 0 || selectedTags.length > 0 || dateRange.from || dateRange.to;

  const results = useMemo(
    () => searchNotes(notes, debouncedQuery, activeChips, logicMode, selectedTags, dateRange),
    [notes, debouncedQuery, activeChips, logicMode, selectedTags, dateRange]
  );

  const toggleChip = useCallback((id: string) => {
    if (id === 'by-tag') {
      setShowTagSelector((p) => !p);
      return;
    }
    if (id === 'by-date') {
      setShowDatePicker((p) => !p);
      return;
    }
    setActiveChips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const handleDateSelect = useCallback((from: number, to: number) => {
    setDateRange({ from, to });
    setShowDatePicker(false);
  }, []);

  // Animated card item (T037)
  const renderItem = useCallback(
    ({ item, index }: { item: Note; index: number }) => (
      <Animated.View entering={FadeInDown.duration(250).delay(index * 40)}>
        <Card
          note={item}
          onPress={() => navigation.navigate('Editor', { noteId: item.id })}
          onLongPress={() => undefined}
        />
      </Animated.View>
    ),
    [navigation]
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header with back */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.back, { color: colors.textSecondary }]}>‹</Text>
        </TouchableOpacity>
        <View style={styles.searchBarWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onDebouncedChange={setDebouncedQuery}
            debounceMs={300}
            placeholder="搜尋筆記、標籤..."
            autoFocus
          />
        </View>
      </View>

      {/* Filter chips (T033) */}
      <View style={[styles.filterRow, { borderBottomColor: colors.divider }]}>
        <FilterChips chips={FILTER_CHIPS} selectedIds={activeChips} onToggle={toggleChip} />
        {/* AND/OR toggle (T034) */}
        <TouchableOpacity
          onPress={() => setLogicMode((m) => (m === 'AND' ? 'OR' : 'AND'))}
          style={[styles.logicToggle, { backgroundColor: colors.chip }]}
        >
          <Text style={[styles.logicLabel, { color: colors.accentGreen }]}>{logicMode}</Text>
        </TouchableOpacity>
      </View>

      {/* Tag selector panel (T035) */}
      {showTagSelector && (
        <View style={[styles.selectorPanel, { borderBottomColor: colors.divider }]}>
          <TagSelector selectedTags={selectedTags} onSelectedTagsChange={setSelectedTags} />
        </View>
      )}

      {/* Date picker panel (T036) */}
      {showDatePicker && (
        <DatePicker
          visible={showDatePicker}
          onSelect={handleDateSelect}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Active filter badges */}
      {(selectedTags.length > 0 || dateRange.from) && (
        <View style={styles.activeBadges}>
          {selectedTags.length > 0 && (
            <TouchableOpacity
              onPress={() => setSelectedTags([])}
              style={[styles.activeBadge, { backgroundColor: colors.chipActive }]}
            >
              <Text style={[styles.activeBadgeText, { color: colors.chipActiveText }]}>
                {selectedTags.length} 個標籤 ✕
              </Text>
            </TouchableOpacity>
          )}
          {dateRange.from && (
            <TouchableOpacity
              onPress={() => setDateRange({})}
              style={[styles.activeBadge, { backgroundColor: colors.chipActive }]}
            >
              <Text style={[styles.activeBadgeText, { color: colors.chipActiveText }]}>
                日期篩選 ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results (T037) */}
      {hasActiveFilter ? (
        <>
          <View style={styles.resultMeta}>
            <Text style={[styles.resultCount, { color: colors.textMuted }]}>
              {results.length} 筆結果
            </Text>
          </View>
          <FlashList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🔍</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  找不到符合的筆記
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <View style={styles.hintState}>
          <Text style={[styles.hintIcon, { color: colors.textMuted }]}>💡</Text>
          <Text style={[styles.hintText, { color: colors.textMuted }]}>
            輸入關鍵字搜尋，多個關鍵字以空格分隔{'\n'}
            使用篩選器精確查找筆記
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  back: {
    fontSize: 28,
    fontWeight: '300',
    marginRight: 8,
    lineHeight: 32,
  },
  searchBarWrap: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingRight: 12,
  },
  logicToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 4,
  },
  logicLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  selectorPanel: {
    maxHeight: 200,
    borderBottomWidth: 1,
  },
  activeBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultMeta: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  hintState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  hintIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
