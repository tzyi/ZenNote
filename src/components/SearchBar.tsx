import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, TextInputProps } from 'react-native';
import { useColors } from '../theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onDebouncedChange?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChangeText,
  onDebouncedChange,
  onClear,
  placeholder = '搜尋筆記...',
  autoFocus = false,
  debounceMs = 300,
  ...rest
}: SearchBarProps) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce handler (T032)
  const handleChange = useCallback(
    (text: string) => {
      onChangeText(text);
      if (onDebouncedChange) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onDebouncedChange(text);
        }, debounceMs);
      }
    },
    [onChangeText, onDebouncedChange, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBackground,
          borderColor: focused ? colors.accentGreen : colors.border,
        },
      ]}
    >
      <Text style={[styles.icon, { color: colors.textMuted }]}>🔍</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: colors.textPrimary }]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        returnKeyType="search"
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            handleChange('');
            onClear?.();
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.clearIcon, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    fontSize: 15,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 13,
    fontWeight: '600',
    paddingLeft: 8,
  },
});
