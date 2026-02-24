import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useColors, useTheme } from '../src/theme';
import { useNotesStore, useSettingsStore } from '../src/store';
import { ThemeMode } from '../src/models';

interface SettingsRowProps {
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  subtitle?: string;
}

function SettingsRow({
  icon,
  label,
  onPress,
  rightElement,
  destructive = false,
  subtitle,
}: SettingsRowProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[styles.row, { borderBottomColor: colors.divider }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: destructive ? colors.accentRed : colors.textPrimary }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement ?? (
        onPress && <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{title}</Text>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { settings, setTheme: setSettingsTheme } = useSettingsStore();
  const { clearRecycleBin, notes } = useNotesStore();

  const recycleBinCount = notes.filter((n) => n.inRecycleBin).length;

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    setSettingsTheme(mode);
  };

  const handleClearRecycleBin = () => {
    Alert.alert(
      '清空回收桶',
      `確定要永久刪除回收桶中的 ${recycleBinCount} 筆筆記嗎？此操作無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清空',
          style: 'destructive',
          onPress: clearRecycleBin,
        },
      ]
    );
  };

  const themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: '深色', value: 'dark', icon: '🌙' },
    { label: '淺色', value: 'light', icon: '☀️' },
    { label: '跟隨系統', value: 'system', icon: '⚙️' },
  ];

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.back, { color: colors.textSecondary }]}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Theme section */}
        <SectionHeader title="外觀" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {themeOptions.map((opt, index) => (
            <SettingsRow
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              onPress={() => handleThemeChange(opt.value)}
              rightElement={
                themeMode === opt.value ? (
                  <Text style={{ color: colors.accentGreen, fontSize: 16 }}>✓</Text>
                ) : null
              }
            />
          ))}
        </View>

        {/* Data management */}
        <SectionHeader title="資料管理" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="📤"
            label="匯出全部筆記"
            subtitle="匯出為 .zip（含 Markdown 與圖片）"
            onPress={() => Alert.alert('即將推出', '批次匯出功能正在開發中')}
          />
          <SettingsRow
            icon="📥"
            label="匯入筆記"
            subtitle="支援 .zip 或 Markdown 格式"
            onPress={() => Alert.alert('即將推出', '匯入功能正在開發中')}
          />
          <SettingsRow
            icon="💾"
            label="本地備份"
            onPress={() => Alert.alert('即將推出', '本地備份功能正在開發中')}
          />
          <SettingsRow
            icon="♻️"
            label="還原備份"
            onPress={() => Alert.alert('即將推出', '還原備份功能正在開發中')}
          />
        </View>

        {/* Recycle bin */}
        <SectionHeader title="回收桶" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="🗑"
            label="管理回收桶"
            subtitle={`${recycleBinCount} 篇待刪除`}
            onPress={() => Alert.alert('即將推出', '回收桶管理功能正在開發中')}
          />
          <SettingsRow
            icon="🧹"
            label="清空回收桶"
            destructive
            subtitle={recycleBinCount > 0 ? `將永久刪除 ${recycleBinCount} 篇筆記` : '回收桶為空'}
            onPress={recycleBinCount > 0 ? handleClearRecycleBin : undefined}
          />
        </View>

        {/* Danger zone */}
        <SectionHeader title="危險操作" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="⚠️"
            label="一鍵重設"
            destructive
            subtitle="清除所有資料，恢復初始狀態"
            onPress={() => {
              Alert.alert(
                '一鍵重設',
                '確定要清除所有資料嗎？此操作無法復原。',
                [
                  { text: '取消', style: 'cancel' },
                  { text: '重設', style: 'destructive', onPress: () => undefined },
                ]
              );
            }}
          />
        </View>

        {/* About */}
        <SectionHeader title="關於" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingsRow
            icon="ℹ️"
            label="版本"
            rightElement={
              <Text style={[styles.versionText, { color: colors.textMuted }]}>1.0.0</Text>
            }
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            ZenNote · 所有資料儲存於本機
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  back: {
    fontSize: 15,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  section: {
    marginHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 26,
    textAlign: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  versionText: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
