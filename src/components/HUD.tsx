import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, PIECE_COLORS } from '@/theme';
import { FallingPiece } from '@/game/types';

type Props = {
  score: number;
  next: FallingPiece;
  isGameOver: boolean;
};

export const HUD: React.FC<Props> = ({ score, next, isGameOver }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tetris</Text>
      <Text style={styles.score}>Score: {score}</Text>
      <View style={[styles.nextBadge, { backgroundColor: PIECE_COLORS[next.kind] }]}>
        <Text style={styles.nextText}>Next: {next.kind}</Text>
      </View>
      {isGameOver && <Text style={styles.gameOver}>ゲームオーバー</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '700' },
  score: { color: COLORS.text, fontSize: 16 },
  nextBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  nextText: { color: '#0b1020', fontWeight: '700' },
  gameOver: { color: COLORS.danger, fontWeight: '700', marginTop: 4 },
});

