import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameScreen } from '@/components/GameScreen';

// 日本語: エントリーポイント。GameScreen を表示するだけの薄いラッパー。
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" />
          <View style={styles.container}>
            <GameScreen />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1 },
});
