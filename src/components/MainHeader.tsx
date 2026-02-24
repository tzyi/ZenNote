import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

interface MainHeaderProps {
  title?: string;
  onMenuPress: () => void;
  onSearchPress: () => void;
  activeFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const FILTERS: { label: string; value: TimeFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '今天', value: 'today' },
  { label: '本週', value: 'week' },
  { label: '本月', value: 'month' },
];

export function MainHeader({
  title = 'ZenNote',
  onMenuPress,
  onSearchPress,
  activeFilter,
  onFilterChange,
}: MainHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.header,
          paddingTop: insets.top + 8,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={onMenuPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.menuIcon, { color: colors.icon }]}>☰</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

        <TouchableOpacity
          onPress={onSearchPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.searchIcon, { color: colors.icon }]}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => onFilterChange(f.value)}
            style={[
              styles.filterTab,
              activeFilter === f.value && { borderBottomColor: colors.accentGreen },
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                {
                  color:
                    activeFilter === f.value ? colors.accentGreen : colors.textSecondary,
                  fontWeight: activeFilter === f.value ? '600' : '400',
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  menuIcon: {
    fontSize: 20,
  },
  searchIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterLabel: {
    fontSize: 13,
  },
});
