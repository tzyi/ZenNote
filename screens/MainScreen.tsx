import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';

import { Card, CardMenu, CardMenuAction, FAB, MainHeader } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore } from '../src/store';
import { Note } from '../src/models';
import { ExportService } from '../src/services/exportService';
import type { RootStackNavigationProp } from '../src/navigation/types';

interface SectionHeader {
  type: 'header';
  title: string;
  key: string;
}
interface NoteItem {
  type: 'note';
  note: Note;
  key: string;
}
type ListItem = SectionHeader | NoteItem;

function getDateLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

function filterNotes(notes: Note[], dateFrom?: number, dateTo?: number): Note[] {
  return notes.filter((n) => {
    if (n.inRecycleBin) return false;
    if (dateFrom !== undefined && n.createdAt < dateFrom) return false;
    if (dateTo !== undefined && n.createdAt > dateTo) return false;
    return true;
  });
}

function buildListItems(notes: Note[]): ListItem[] {
  const sorted = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt - a.createdAt;
  });

  const items: ListItem[] = [];
  let currentDate = '';

  for (const note of sorted) {
    const dateLabel = getDateLabel(note.createdAt);
    if (dateLabel !== currentDate) {
      currentDate = dateLabel;
      items.push({ type: 'header', title: dateLabel, key: `header-${dateLabel}` });
    }
    items.push({ type: 'note', note, key: note.id });
  }
  return items;
}

export default function MainScreen() {
  const colors = useColors();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { notes, moveToRecycleBin, togglePin } = useNotesStore();
  const [dateFrom, setDateFrom] = useState<number | undefined>(undefined);
  const [dateTo, setDateTo] = useState<number | undefined>(undefined);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleDateChange = useCallback((from?: number, to?: number) => {
    setDateFrom(from);
    setDateTo(to);
  }, []);

  const filtered = filterNotes(notes, dateFrom, dateTo);
  const listItems = buildListItems(filtered);

  const handleCardLongPress = useCallback((note: Note) => {
    setSelectedNote(note);
    setMenuVisible(true);
  }, []);

  const menuActions: CardMenuAction[] = selectedNote
    ? [
        {
          icon: '📌',
          label: selectedNote.isPinned ? '取消置頂' : '置頂',
          onPress: () => togglePin(selectedNote.id),
        },
        {
          icon: '🗑',
          label: '刪除',
          onPress: () => moveToRecycleBin(selectedNote.id),
          destructive: true,
        },
        {
          icon: '↗️',
          label: '分享',
          onPress: () => {
            if (selectedNote) {
              ExportService.shareNote(selectedNote);
            }
          },
        },
      ]
    : [];

  const handleBatchExport = useCallback(() => {
    const activeNotes = notes.filter((n) => !n.inRecycleBin);
    if (activeNotes.length === 0) {
      Alert.alert('無筆記', '沒有可匯出的筆記');
      return;
    }
    Alert.alert(
      '批次匯出',
      `將匯出 ${activeNotes.length} 篇筆記為 Markdown 格式`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '匯出',
          onPress: () => ExportService.shareNotes(activeNotes),
        },
      ]
    );
  }, [notes]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') {
        return (
          <View style={[styles.sectionHeader, { borderLeftColor: colors.accentGreen }]}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{item.title}</Text>
          </View>
        );
      }
      const { note } = item;
      return (
        <Card
          note={note}
          onPress={() => navigation.navigate('Editor', { noteId: note.id })}
          onLongPress={() => handleCardLongPress(note)}
        />
      );
    },
    [colors, navigation, handleCardLongPress]
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <MainHeader
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        onSearchPress={() => navigation.navigate('Drawer', { screen: 'Search' } as never)}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={handleDateChange}
      />

      <FlashList
        data={listItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        estimatedItemSize={120}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              還沒有筆記，點擊 + 開始記錄
            </Text>
          </View>
        }
      />

      <FAB
        onPress={() => navigation.navigate('Editor')}
        onLongPress={handleBatchExport}
        style={styles.fab}
      />

      <CardMenu
        visible={menuVisible}
        actions={menuActions}
        onClose={() => {
          setMenuVisible(false);
          setSelectedNote(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    marginLeft: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyState: {
    flex: 1,
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
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
  },
});
