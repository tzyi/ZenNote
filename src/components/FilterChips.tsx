import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useColors } from '../theme';

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function FilterChips({ chips, selectedIds, onToggle }: FilterChipsProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const active = selectedIds.includes(chip.id);
        return (
          <TouchableOpacity
            key={chip.id}
            onPress={() => onToggle(chip.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.chipActive : colors.chip,
                borderColor: active ? colors.chipActive : colors.border,
              },
            ]}
          >
            {chip.icon && <Text style={styles.chipIcon}>{chip.icon}</Text>}
            <Text
              style={[
                styles.chipLabel,
                { color: active ? colors.chipActiveText : colors.chipText },
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIcon: {
    fontSize: 13,
    marginRight: 4,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
