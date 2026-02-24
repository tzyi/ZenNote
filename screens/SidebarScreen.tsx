import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';

import { SidebarNav } from '../src/components';
import { useColors } from '../src/theme';
import { useNotesStore, useTagsStore } from '../src/store';

// Simple heatmap: shows last 16 weeks activity
function ActivityHeatmap() {
  const colors = useColors();
  const { notes } = useNotesStore();

  const heatmap = useMemo(() => {
    const now = Date.now();
    const WEEK = 7 * 24 * 3600 * 1000;
    const DAY = 24 * 3600 * 1000;
    const WEEKS = 16;

    // Count notes per day for last 16 weeks
    const dayCounts: Record<number, number> = {};
    for (const note of notes) {
      if (note.inRecycleBin) continue;
      const dayKey = Math.floor(note.createdAt / DAY);
      dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + 1;
    }

    const grid: number[][] = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const week: number[] = [];
      for (let d = 6; d >= 0; d--) {
        const dayStart = now - w * WEEK - d * DAY;
        const dayKey = Math.floor(dayStart / DAY);
        week.push(dayCounts[dayKey] ?? 0);
      }
      grid.push(week);
    }
    return grid;
  }, [notes]);

  const maxCount = Math.max(...heatmap.flat(), 1);

  const getColor = (count: number) => {
    if (count === 0) return colors.surfaceVariant;
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#1b5e20';
    if (intensity < 0.5) return '#2e7d32';
    if (intensity < 0.75) return '#388e3c';
    return '#4caf50';
  };

  return (
    <View style={styles.heatmapContainer}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>活躍度</Text>
      <View style={styles.heatmapGrid}>
        {heatmap.map((week, wi) => (
          <View key={wi} style={styles.heatmapWeek}>
            {week.map((count, di) => (
              <View
                key={di}
                style={[styles.heatmapCell, { backgroundColor: getColor(count) }]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function SidebarScreen({ navigation }: DrawerContentComponentProps) {
  const colors = useColors();
  const { notes } = useNotesStore();
  const { tags } = useTagsStore();

  const activeNotes = notes.filter((n) => !n.inRecycleBin);
  const recycleBinCount = notes.filter((n) => n.inRecycleBin).length;

  const navItems = [
    {
      label: '全部筆記',
      icon: '📋',
      onPress: () => {
        navigation.navigate('Main');
        navigation.dispatch(DrawerActions.closeDrawer());
      },
      active: true,
    },
    {
      label: '每日回顧',
      icon: '🔄',
      onPress: () => {
        navigation.navigate('DailyReview');
        navigation.dispatch(DrawerActions.closeDrawer());
      },
    },
    {
      label: `回收桶 ${recycleBinCount > 0 ? `(${recycleBinCount})` : ''}`,
      icon: '🗑',
      onPress: () => {
        navigation.dispatch(DrawerActions.closeDrawer());
      },
    },
  ];

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.sidebar }]}
      edges={['top', 'left', 'bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Activity heatmap */}
        <ActivityHeatmap />

        {/* Stats */}
        <View style={[styles.statsRow, { borderColor: colors.divider }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {activeNotes.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>筆記</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.textPrimary }]}>
              {tags.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>標籤</Text>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>標籤</Text>
            {tags.slice(0, 20).map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={styles.tagItem}
                onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
              >
                <Text style={[styles.tagName, { color: colors.accentGreen }]}>#{tag.name}</Text>
                <Text style={[styles.tagCount, { color: colors.textMuted }]}>{tag.noteCount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Nav items and settings at bottom */}
      <SidebarNav
        items={navItems}
        onSettingsPress={() => {
          navigation.navigate('Settings');
          navigation.dispatch(DrawerActions.closeDrawer());
        }}
        noteCount={activeNotes.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  heatmapContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heatmapGrid: {
    flexDirection: 'row',
    gap: 2,
  },
  heatmapWeek: {
    flexDirection: 'column',
    gap: 2,
  },
  heatmapCell: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tagName: {
    fontSize: 14,
  },
  tagCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
