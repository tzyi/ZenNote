import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme';
import { DatePicker } from './DatePicker';

interface MainHeaderProps {
  title?: string;
  onMenuPress: () => void;
  onSearchPress: () => void;
  dateFrom?: number;
  dateTo?: number;
  onDateChange: (from?: number, to?: number) => void;
}

export function MainHeader({
  title = 'ZenNote',
  onMenuPress,
  onSearchPress,
  dateFrom,
  dateTo,
  onDateChange,
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

      {/* Date range picker */}
      <DatePicker dateFrom={dateFrom} dateTo={dateTo} onDateChange={onDateChange} />
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
});
