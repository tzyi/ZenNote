import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { Card } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { Note } from '../src/models';
import type { RootStackParamList, RootStackNavigationProp } from '../src/navigation/types';

type TagAggregateRoute = RouteProp<RootStackParamList, 'TagAggregate'>;

export default function TagAggregateScreen() {
  const colors = useColors();
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<TagAggregateRoute>();
  const tagName = route.params?.tagName ?? '';
  const { notes } = useNotesStore();

  const filteredNotes = useMemo(
    () =>
      notes
        .filter(
          (n) =>
            !n.inRecycleBin &&
            n.tags.some((t) => t.toLowerCase() === tagName.toLowerCase())
        )
        .sort((a, b) => b.createdAt - a.createdAt),
    [notes, tagName]
  );

  const renderItem = useCallback(
    ({ item }: { item: Note }) => (
      <Card
        note={item}
        onPress={() => navigation.navigate('Editor', { noteId: item.id })}
        onLongPress={() => undefined}
      />
    ),
    [navigation]
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.back, { color: colors.textSecondary }]}>‹ 返回</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={[styles.tagIcon, { color: colors.accentGreen }]}>#</Text>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{tagName}</Text>
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {filteredNotes.length} 篇
        </Text>
      </View>

      {/* List */}
      <FlashList
        data={filteredNotes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>🏷️</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              此標籤下沒有筆記
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  back: {
    fontSize: 15,
    fontWeight: '500',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagIcon: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
