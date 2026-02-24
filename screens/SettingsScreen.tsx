import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  ExportPanel,
  ImportPanel,
  BackupPanel,
  RecycleBinManager,
  ResetPanel,
  AboutPanel,
} from '../src/components';
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
  const { notes } = useNotesStore();
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    setSettingsTheme(mode);
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

        {/* Theme section (T044) */}
        <SectionHeader title="外觀" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {themeOptions.map((opt) => (
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

        {/* Data export/import (T045, T046) */}
        <SectionHeader title="資料管理" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelRow}>
            <ExportPanel />
          </View>
          <View style={[styles.panelRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <ImportPanel />
          </View>
        </View>

        {/* Backup (T048) */}
        <SectionHeader title="備份" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelRow}>
            <BackupPanel />
          </View>
        </View>

        {/* Recycle bin inline manager (T047) */}
        <SectionHeader title="回收桶" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowRecycleBin((p) => !p)}
          >
            <Text style={styles.rowIcon}>🗑</Text>
            <Text style={[styles.rowLabel, { color: colors.textPrimary, flex: 1 }]}>
              管理回收桶
            </Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>
              {showRecycleBin ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {showRecycleBin && (
            <View style={[styles.panelRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <RecycleBinManager />
            </View>
          )}
        </View>

        {/* Reset (T049) */}
        <SectionHeader title="危險操作" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelRow}>
            <ResetPanel />
          </View>
        </View>

        {/* About (T050) */}
        <SectionHeader title="關於" />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelRow}>
            <AboutPanel />
          </View>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  panelRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
  },
});
