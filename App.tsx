import './global.css';

import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

import { ThemeProvider, useTheme } from './src/theme';
import { RootNavigator } from './src/navigation';
import { useNotesStore, useTagsStore, useSettingsStore } from './src/store';

function AppContent() {
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const hydrateNotes = useNotesStore((s) => s.hydrateNotes);
  const hydrateTags = useTagsStore((s) => s.hydrateTags);
  const hydrateSettings = useSettingsStore((s) => s.hydrateSettings);

  useEffect(() => {
    async function load() {
      await Promise.all([hydrateNotes(), hydrateTags(), hydrateSettings()]);
      setReady(true);
    }
    load();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
});

