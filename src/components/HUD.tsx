import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
const { Ionicons } = require('@expo/vector-icons');
import { COLORS, PIECE_COLORS } from '@/theme';
import { FallingPiece } from '@/game/types';

type Props = {
  score: number;
  next: FallingPiece;
  isGameOver: boolean;
  showSettingsButton: boolean;
  onPressSettings: () => void;
  highScore: number;
};

export const HUD: React.FC<Props> = ({ score, next, isGameOver, showSettingsButton, onPressSettings, highScore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Tetris Nova</Text>
        {showSettingsButton ? (
          <Pressable
            accessibilityLabel="サウンド設定"
            style={styles.settingsButton}
            onPress={onPressSettings}
          >
            <Ionicons name="settings-sharp" size={18} color={COLORS.text} />
          </Pressable>
        ) : (
          <View style={styles.settingsButtonPlaceholder} />
        )}
      </View>
      <View style={styles.infoRow}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>スコア</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.bestLabel}>ベスト {highScore}</Text>
        </View>
        <View style={[styles.nextBadge, { borderColor: PIECE_COLORS[next.kind] }]}>
          <Text style={styles.nextLabel}>Next</Text>
          <Text style={[styles.nextKind, { color: PIECE_COLORS[next.kind] }]}>{next.kind}</Text>
        </View>
      </View>
      {isGameOver && <Text style={styles.gameOver}>ゲームオーバー</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
    width: '100%',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  scoreBadge: {
    flex: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
    minWidth: 160,
  },
  scoreLabel: { color: COLORS.text, opacity: 0.72, fontSize: 12, letterSpacing: 2 },
  scoreValue: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  bestLabel: { color: COLORS.text, opacity: 0.75, fontSize: 12, marginTop: 4 },
  nextBadge: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(15,23,42,0.72)',
    justifyContent: 'center',
    minWidth: 100,
  },
  nextLabel: { color: COLORS.text, opacity: 0.7, fontSize: 12, letterSpacing: 1 },
  nextKind: { fontSize: 18, fontWeight: '800' },
  gameOver: {
    color: COLORS.danger,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
  settingsButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.32)',
    backgroundColor: 'rgba(15,23,42,0.52)',
  },
  settingsButtonPlaceholder: {
    width: 34,
    height: 34,
  },
});
