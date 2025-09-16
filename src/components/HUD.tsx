import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
const { Ionicons } = require('@expo/vector-icons');
import { COLORS, PIECE_COLORS } from '@/theme';
import { FallingPiece } from '@/game/types';

type Props = {
  score: number;
  next: FallingPiece;
  isGameOver: boolean;
  activeBgmTitle: string;
};

export const HUD: React.FC<Props> = ({ score, next, isGameOver, activeBgmTitle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Tetris Nova</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>スコア</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>
      <View style={styles.badgeRow}>
        <View style={[styles.nextBadge, { borderColor: PIECE_COLORS[next.kind] }]}>
          <Text style={styles.nextLabel}>ネクスト</Text>
          <Text style={[styles.nextKind, { color: PIECE_COLORS[next.kind] }]}>{next.kind}</Text>
        </View>
        <View style={styles.bgmBadge}>
          <Ionicons name="musical-notes-sharp" size={16} color={COLORS.text} />
          <Text style={styles.bgmText}>{activeBgmTitle}</Text>
        </View>
      </View>
      {isGameOver && <Text style={styles.gameOver}>ゲームオーバー</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', letterSpacing: 4 },
  scoreBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.35)',
  },
  scoreLabel: { color: COLORS.text, opacity: 0.72, fontSize: 12, letterSpacing: 2 },
  scoreValue: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', gap: 12 },
  nextBadge: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  nextLabel: { color: COLORS.text, opacity: 0.7, fontSize: 12, letterSpacing: 2 },
  nextKind: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  bgmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(78,70,229,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(129,140,248,0.28)',
  },
  bgmText: { color: COLORS.text, fontWeight: '600' },
  gameOver: {
    color: COLORS.danger,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
});
