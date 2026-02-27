import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { useColors } from '../theme';

interface DatePickerProps {
  dateFrom?: number;
  dateTo?: number;
  onDateChange: (from?: number, to?: number) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(ts: number | undefined, year: number, month: number, day: number): boolean {
  if (ts === undefined) return false;
  const d = new Date(ts);
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

function startOfDay(year: number, month: number, day: number): number {
  return new Date(year, month, day, 0, 0, 0, 0).getTime();
}

function endOfDay(year: number, month: number, day: number): number {
  return new Date(year, month, day, 23, 59, 59, 999).getTime();
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

type SelectingMode = 'from' | 'to';

export function DatePicker({ dateFrom, dateTo, onDateChange }: DatePickerProps) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectingMode, setSelectingMode] = useState<SelectingMode>('from');

  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [tempFrom, setTempFrom] = useState<number | undefined>(dateFrom);
  const [tempTo, setTempTo] = useState<number | undefined>(dateTo);

  const hasFilter = dateFrom !== undefined || dateTo !== undefined;

  const openModal = useCallback(
    (mode: SelectingMode) => {
      setSelectingMode(mode);
      setTempFrom(dateFrom);
      setTempTo(dateTo);
      const relevantDate = mode === 'from' ? dateFrom : dateTo;
      if (relevantDate) {
        const d = new Date(relevantDate);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      } else {
        const n = new Date();
        setViewYear(n.getFullYear());
        setViewMonth(n.getMonth());
      }
      setModalVisible(true);
    },
    [dateFrom, dateTo],
  );

  const handleDayPress = useCallback(
    (year: number, month: number, day: number) => {
      if (selectingMode === 'from') {
        const ts = startOfDay(year, month, day);
        setTempFrom(ts);
        setTempTo((prev) => (prev !== undefined && ts > prev ? undefined : prev));
      } else {
        const ts = endOfDay(year, month, day);
        setTempTo(ts);
        setTempFrom((prev) => (prev !== undefined && ts < prev ? undefined : prev));
      }
    },
    [selectingMode],
  );

  const handleConfirm = useCallback(() => {
    onDateChange(tempFrom, tempTo);
    setModalVisible(false);
  }, [tempFrom, tempTo, onDateChange]);

  const handleClear = useCallback(() => {
    onDateChange(undefined, undefined);
    setModalVisible(false);
  }, [onDateChange]);

  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const isInRange = useCallback(
    (day: number): boolean => {
      if (tempFrom === undefined || tempTo === undefined) return false;
      const ts = startOfDay(viewYear, viewMonth, day);
      return ts >= tempFrom && ts <= tempTo;
    },
    [tempFrom, tempTo, viewYear, viewMonth],
  );

  const isFromDay = useCallback(
    (day: number): boolean => isSameDay(tempFrom, viewYear, viewMonth, day),
    [tempFrom, viewYear, viewMonth],
  );

  const isToDay = useCallback(
    (day: number): boolean => isSameDay(tempTo, viewYear, viewMonth, day),
    [tempTo, viewYear, viewMonth],
  );

  return (
    <>
      {/* Inline trigger row in header */}
      <View style={styles.triggerRow}>
        <TouchableOpacity
          onPress={() => openModal('from')}
          style={[
            styles.dateBtn,
            {
              backgroundColor: dateFrom ? colors.accentGreen + '20' : colors.chip,
              borderColor: dateFrom ? colors.accentGreen : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.dateBtnText,
              { color: dateFrom ? colors.accentGreen : colors.textSecondary },
            ]}
          >
            {dateFrom ? formatDate(dateFrom) : '起始日期'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.dateSeparator, { color: colors.textMuted }]}>~</Text>

        <TouchableOpacity
          onPress={() => openModal('to')}
          style={[
            styles.dateBtn,
            {
              backgroundColor: dateTo ? colors.accentGreen + '20' : colors.chip,
              borderColor: dateTo ? colors.accentGreen : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.dateBtnText,
              { color: dateTo ? colors.accentGreen : colors.textSecondary },
            ]}
          >
            {dateTo ? formatDate(dateTo) : '結束日期'}
          </Text>
        </TouchableOpacity>

        {hasFilter && (
          <TouchableOpacity
            onPress={() => onDateChange(undefined, undefined)}
            style={styles.clearInline}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.clearInlineText, { color: colors.accentRed }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={[
              styles.modal,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Mode tabs */}
            <View style={[styles.modeTabs, { borderBottomColor: colors.divider }]}>
              <TouchableOpacity
                onPress={() => setSelectingMode('from')}
                style={[
                  styles.modeTab,
                  selectingMode === 'from' && {
                    borderBottomColor: colors.accentGreen,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color:
                        selectingMode === 'from'
                          ? colors.accentGreen
                          : colors.textSecondary,
                    },
                  ]}
                >
                  起始日期
                </Text>
                {tempFrom !== undefined && (
                  <Text style={[styles.modeTabDate, { color: colors.accentGreen }]}>
                    {formatDate(tempFrom)}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectingMode('to')}
                style={[
                  styles.modeTab,
                  selectingMode === 'to' && {
                    borderBottomColor: colors.accentGreen,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color:
                        selectingMode === 'to'
                          ? colors.accentGreen
                          : colors.textSecondary,
                    },
                  ]}
                >
                  結束日期
                </Text>
                {tempTo !== undefined && (
                  <Text style={[styles.modeTabDate, { color: colors.accentGreen }]}>
                    {formatDate(tempTo)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Month navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goToPrevMonth} hitSlop={8}>
                <Text style={[styles.navArrow, { color: colors.textPrimary }]}>◀</Text>
              </TouchableOpacity>
              <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>
                {viewYear}年 {MONTHS[viewMonth]}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} hitSlop={8}>
                <Text style={[styles.navArrow, { color: colors.textPrimary }]}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <View key={wd} style={styles.weekdayCell}>
                  <Text style={[styles.weekdayText, { color: colors.textMuted }]}>
                    {wd}
                  </Text>
                </View>
              ))}
            </View>

            {/* Days grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((day, i) => (
                <View key={i} style={styles.dayCell}>
                  {day !== null ? (
                    <TouchableOpacity
                      onPress={() => handleDayPress(viewYear, viewMonth, day)}
                      style={[
                        styles.dayBtn,
                        (isFromDay(day) || isToDay(day)) && {
                          backgroundColor: colors.accentGreen,
                        },
                        isInRange(day) &&
                          !isFromDay(day) &&
                          !isToDay(day) && {
                            backgroundColor: colors.accentGreen + '30',
                          },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          {
                            color:
                              isFromDay(day) || isToDay(day)
                                ? '#fff'
                                : colors.textPrimary,
                          },
                          isInRange(day) &&
                            !isFromDay(day) &&
                            !isToDay(day) && { color: colors.accentGreen },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>

            {/* Action buttons */}
            <View style={[styles.actions, { borderTopColor: colors.divider }]}>
              {(tempFrom !== undefined || tempTo !== undefined) && (
                <TouchableOpacity onPress={handleClear} style={styles.actionBtn}>
                  <Text style={[styles.actionText, { color: colors.accentRed }]}>
                    清除
                  </Text>
                </TouchableOpacity>
              )}
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.actionBtn}
              >
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                  取消
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: colors.accentGreen }]}>
                  確認
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  dateBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearInline: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  clearInlineText: {
    fontSize: 16,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '88%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modeTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeTabDate: {
    fontSize: 12,
    marginTop: 2,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navArrow: {
    fontSize: 16,
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
