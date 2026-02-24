import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme';

interface AboutPanelProps {
  version?: string;
}

export function AboutPanel({ version = '1.0.0' }: AboutPanelProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* App logo area */}
        <View style={[styles.logoContainer, { backgroundColor: colors.accentGreen }]}>
          <Text style={styles.logoText}>Z</Text>
        </View>

        <Text style={[styles.appName, { color: colors.textPrimary }]}>ZenNote</Text>
        <Text style={[styles.tagline, { color: colors.textMuted }]}>
          簡約卡片筆記
        </Text>

        <View style={[styles.versionRow, { borderTopColor: colors.divider }]}>
          <Text style={[styles.versionLabel, { color: colors.textMuted }]}>版本</Text>
          <Text style={[styles.versionValue, { color: colors.textPrimary }]}>
            {version}
          </Text>
        </View>

        <View style={[styles.infoRow, { borderTopColor: colors.divider }]}>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            所有資料僅儲存於本機裝置
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    marginBottom: 20,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
  },
  versionLabel: {
    fontSize: 14,
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    width: '100%',
    paddingTop: 14,
    marginTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
