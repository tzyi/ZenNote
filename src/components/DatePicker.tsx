import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useColors } from '../theme';

interface DatePickerProps {
  dateFrom?: number;
  dateTo?: number;
  onDateChange: (from?: number, to?: number) => void;
}

const QUICK_RANGES = [
  { label: '今天', days: 1 },
  { label: '過去 3 天', days: 3 },
  { label: '本週', days: 7 },
  { label: '本月', days: 30 },
  { label: '過去 3 個月', days: 90 },
  { label: '今年', days: 365 },
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function DatePicker({ dateFrom, dateTo, onDateChange }: DatePickerProps) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);

  const handleQuickRange = useCallback(
    (days: number) => {
      const now = Date.now();
      const DAY = 86400000;
      onDateChange(now - days * DAY, now);
      setModalVisible(false);
    },
    [onDateChange]
  );

  const handleClear = useCallback(() => {
    onDateChange(undefined, undefined);
    setModalVisible(false);
  }, [onDateChange]);

  const hasDateFilter = dateFrom !== undefined || dateTo !== undefined;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.trigger,
          {
            backgroundColor: hasDateFilter ? colors.accentGreen : colors.chip,
            borderColor: hasDateFilter ? colors.accentGreen : colors.border,
          },
        ]}
      >
        <Text style={styles.triggerIcon}>📅</Text>
        <Text
          style={[
            styles.triggerText,
            {
              color: hasDateFilter ? colors.textInverse : colors.chipText,
            },
          ]}
        >
          {hasDateFilter && dateFrom
            ? `${formatDate(dateFrom)} ~`
            : '日期篩選'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              選擇日期範圍
            </Text>

            <ScrollView>
              {QUICK_RANGES.map((range) => (
                <TouchableOpacity
                  key={range.label}
                  onPress={() => handleQuickRange(range.days)}
                  style={[styles.rangeItem, { borderBottomColor: colors.divider }]}
                >
                  <Text style={[styles.rangeLabel, { color: colors.textPrimary }]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {hasDateFilter && (
              <TouchableOpacity
                onPress={handleClear}
                style={[styles.clearBtn, { borderTopColor: colors.divider }]}
              >
                <Text style={[styles.clearText, { color: colors.accentRed }]}>
                  清除篩選
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  triggerIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rangeItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  rangeLabel: {
    fontSize: 15,
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
