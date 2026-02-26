import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../theme';

interface SidebarNavItem {
  label: string;
  icon: string;
  onPress: () => void;
  active?: boolean;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  onSettingsPress: () => void;
  username?: string;
  noteCount?: number;
}

export function SidebarNav({
  items,
  onSettingsPress,
  username = 'ZenNote 用戶',
  noteCount = 0,
}: SidebarNavProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* User profile */}
      <View style={[styles.profile, { borderBottomColor: colors.divider }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accentGreen }]}>
          <Text style={[styles.avatarText, { color: colors.textInverse }]}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.username, { color: colors.textPrimary }]}>{username}</Text>
          <Text style={[styles.noteCount, { color: colors.textMuted }]}>
            {noteCount} 篇筆記
          </Text>
        </View>
      </View>

      {/* Nav items */}
      <View style={styles.navItems}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={[
              styles.navItem,
              item.active && { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.navLabel,
                {
                  color: item.active ? colors.accentGreen : colors.textSecondary,
                  fontWeight: item.active ? '600' : '400',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings button */}
      <TouchableOpacity
        onPress={onSettingsPress}
        style={[styles.settingsBtn, { borderTopColor: colors.divider, marginBottom: Math.max(insets.bottom, 16) }]}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
        <Text style={[styles.settingsLabel, { color: colors.textSecondary }]}>設定</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
  },
  noteCount: {
    fontSize: 12,
    marginTop: 2,
  },
  navItems: {
    paddingVertical: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  navIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 14,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 'auto',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  settingsIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingsLabel: {
    fontSize: 14,
  },
});
