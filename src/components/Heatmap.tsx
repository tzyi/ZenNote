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
const COL_WIDTH = CELL_SIZE + CELL_GAP; // 13
const DAY_LABEL_WIDTH = 16;
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Row 0 = Monday … Row 6 = Sunday
const DAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
// Show only Mon(0), Wed(2), Fri(4) to avoid crowding
const SHOW_DAY_ROWS = new Set([0, 2, 4]);

interface MonthLabel {
  colIndex: number;
  label: string;
}

export function Heatmap({ notes, weeks = 13 }: HeatmapProps) {
  const colors = useColors();

  const { grid, maxCount, totalCount, monthLabels, gridWidth } = useMemo(() => {
    const DAY = 24 * 3600 * 1000;

    // Count notes per UTC day key
    const dayCounts: Record<number, number> = {};
    let total = 0;
    for (const note of notes) {
      if (note.inRecycleBin) continue;
      const dayKey = Math.floor(note.createdAt / DAY);
      dayCounts[dayKey] = (dayCounts[dayKey] ?? 0) + 1;
      total++;
    }

    // UTC day number for today
    const todayDayKey = Math.floor(Date.now() / DAY);
    // JS getUTCDay(): 0=Sun, 1=Mon…6=Sat → convert to Mon=0…Sun=6
    const todayDow = new Date(todayDayKey * DAY).getUTCDay();
    const daysFromMonday = (todayDow + 6) % 7; // 0 if today is Mon
    // Day key of the most recent Monday (start of current week)
    const currentWeekMondayKey = todayDayKey - daysFromMonday;

    const heatmap: number[][] = [];
    const labels: MonthLabel[] = [];
    let lastMonth = -1;

    for (let w = weeks - 1; w >= 0; w--) {
      const colIndex = (weeks - 1) - w; // 0 = leftmost column
      const weekMondayKey = currentWeekMondayKey - w * 7;

      const week: number[] = [];
      for (let d = 0; d < 7; d++) {
        // d=0 → Monday … d=6 → Sunday
        const dayKey = weekMondayKey + d;
        // Future days (in the current partial week) → -1 (transparent)
        week.push(dayKey > todayDayKey ? -1 : (dayCounts[dayKey] ?? 0));
      }
      heatmap.push(week);

      // Month label: use the day at d=3 (Thursday) for stable month detection
      const month = new Date((weekMondayKey + 3) * DAY).getUTCMonth();
      if (month !== lastMonth) {
        labels.push({ colIndex, label: MONTH_ABBR[month] });
        lastMonth = month;
      }
    }

    return {
      grid: heatmap,
      maxCount: Math.max(...heatmap.flat().filter((v) => v >= 0), 1),
      totalCount: total,
      monthLabels: labels,
      gridWidth: weeks * COL_WIDTH - CELL_GAP,
    };
  }, [notes, weeks]);

  const getColor = (count: number) => {
    if (count < 0) return 'transparent'; // future day in current week
    if (count === 0) return colors.surfaceVariant;
    const intensity = count / maxCount;
    if (intensity < 0.25) return '#1b5e20';
    if (intensity < 0.5) return '#2e7d32';
    if (intensity < 0.75) return '#388e3c';
    return '#4caf50';
  };

  // Total grid height = 7 cells + 6 gaps
  const gridHeight = 7 * CELL_SIZE + 6 * CELL_GAP;
  // Month row height + its bottom margin
  const MONTH_ROW_HEIGHT = 14;
  const MONTH_ROW_MARGIN = 2;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>活躍度</Text>
        <Text style={[styles.countLabel, { color: colors.textMuted }]}>
          {totalCount} 篇筆記
        </Text>
      </View>

      {/* Day labels + grid laid out side by side */}
      <View style={styles.heatmapRow}>
        {/* Left: weekday labels (Mon…Sun), aligned with grid rows */}
        <View
          style={[
            styles.dayLabelCol,
            { height: MONTH_ROW_HEIGHT + MONTH_ROW_MARGIN + gridHeight },
          ]}
        >
          {DAY_LABELS.map((label, i) =>
            SHOW_DAY_ROWS.has(i) ? (
              <Text
                key={i}
                style={[
                  styles.dayLabel,
                  {
                    color: colors.textMuted,
                    top: MONTH_ROW_HEIGHT + MONTH_ROW_MARGIN + i * COL_WIDTH,
                  },
                ]}
              >
                {label}
              </Text>
            ) : null,
          )}
        </View>

        {/* Right: month labels + grid */}
        <View>
          {/* Month labels row */}
          <View style={[styles.monthRow, { width: gridWidth }]}>
            {monthLabels.map((m) => (
              <Text
                key={m.colIndex}
                style={[
                  styles.monthLabel,
                  { color: colors.textMuted, left: m.colIndex * COL_WIDTH },
                ]}
                numberOfLines={1}
              >
                {m.label}
              </Text>
            ))}
          </View>
          {/* Cell grid: columns = weeks, rows = Mon…Sun */}
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
        </View>
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
  /* Heatmap area: day-label column + grid column side by side */
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dayLabelCol: {
    width: DAY_LABEL_WIDTH,
    position: 'relative',
    marginRight: 2,
  },
  dayLabel: {
    position: 'absolute',
    left: 0,
    fontSize: 9,
    fontWeight: '500',
    lineHeight: CELL_SIZE,
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
  grid: {
    flexDirection: 'row',
    gap: CELL_GAP,
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
