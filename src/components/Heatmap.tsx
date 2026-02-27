import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';
import { Note } from '../models';

interface HeatmapProps {
  notes: Note[];
  weeks?: number;
}

const CELL_SIZE = 11;
const CELL_GAP = 2;
const COL_WIDTH = CELL_SIZE + CELL_GAP;
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MonthLabel {
  colIndex: number;
  label: string;
}

export function Heatmap({ notes, weeks = 13 }: HeatmapProps) {
  const colors = useColors();

  const { grid, maxCount, totalCount, monthLabels, gridWidth } = useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 3600 * 1000;
    const WEEK = 7 * DAY;

    // Count notes per day
    const dayCounts: Record<number, number> = {};
    let total = 0;
    for (const note of notes) {
      if (note.inRecycleBin) continue;
      const dayKey = Math.floor(note.createdAt / DAY);
      dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + 1;
      total++;
    }

    const heatmap: number[][] = [];
    const labels: MonthLabel[] = [];
    let lastMonth = -1;

    for (let w = weeks - 1; w >= 0; w--) {
      const colIndex = (weeks - 1) - w; // 0-based column index (left to right)
      const week: number[] = [];
      for (let d = 6; d >= 0; d--) {
        const dayStart = now - w * WEEK - d * DAY;
        const dayKey = Math.floor(dayStart / DAY);
        week.push(dayCounts[dayKey] ?? 0);
      }
      heatmap.push(week);

      // Determine month label – use the middle day of the week column for accuracy
      const midDayMs = now - w * WEEK - 3 * DAY;
      const month = new Date(midDayMs).getMonth();
      if (month !== lastMonth) {
        labels.push({ colIndex, label: MONTH_ABBR[month] });
        lastMonth = month;
      }
    }

    return {
      grid: heatmap,
      maxCount: Math.max(...heatmap.flat(), 1),
      totalCount: total,
      monthLabels: labels,
      gridWidth: weeks * COL_WIDTH - CELL_GAP,
    };
  }, [notes, weeks]);

  const getColor = (count: number) => {
    if (count === 0) return colors.surfaceVariant;
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#1b5e20';
    if (intensity < 0.5) return '#2e7d32';
    if (intensity < 0.75) return '#388e3c';
    return '#4caf50';
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>活躍度</Text>
        <Text style={[styles.countLabel, { color: colors.textMuted }]}>
          {totalCount} 篇筆記
        </Text>
      </View>
      {/* Month labels row */}
      <View style={[styles.monthRow, { width: gridWidth }]}>
        {monthLabels.map((m) => (
          <Text
            key={m.colIndex}
            style={[styles.monthLabel, { color: colors.textMuted, left: m.colIndex * COL_WIDTH }]}
            numberOfLines={1}
          >{m.label}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {grid.map((week, wi) => (
          <View key={wi} style={styles.week}>
            {week.map((count, di) => (
              <View
                key={di}
                style={[styles.cell, { backgroundColor: getColor(count) }]}
              />
            ))}
          </View>
        ))}
      </View>
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: colors.textMuted }]}>少</Text>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
          <View
            key={i}
            style={[
              styles.legendCell,
              {
                backgroundColor:
                  intensity === 0
                    ? colors.surfaceVariant
                    : i === 1
                      ? '#1b5e20'
                      : i === 2
                        ? '#2e7d32'
                        : i === 3
                          ? '#388e3c'
                          : '#4caf50',
              },
            ]}
          />
        ))}
        <Text style={[styles.legendText, { color: colors.textMuted }]}>多</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countLabel: {
    fontSize: 11,
  },
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  monthRow: {
    position: 'relative',
    height: 14,
    marginBottom: 2,
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 9,
    fontWeight: '500',
  },
  week: {
    flexDirection: 'column',
    gap: CELL_GAP,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 2,
  },
  legendText: {
    fontSize: 9,
    marginHorizontal: 4,
  },
  legendCell: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
});
