import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Board as BoardType, FallingPiece } from '@/game/types';
import { COLORS } from '@/theme';
import { Cell } from './Cell';

type Props = {
  board: BoardType;
  piece: FallingPiece;
  cellSize: number;
};

export const Board: React.FC<Props> = ({ board, piece, cellSize }) => {
  // 日本語: 表示用の合成（board + falling piece）。色は簡易的に kind で決定。
  const display = board.map((row) => row.slice());
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const rr = piece.position.row + r;
        const cc = piece.position.col + c;
        if (rr >= 0 && rr < display.length && cc >= 0 && cc < display[0].length) {
          display[rr][cc] = 1;
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      {display.map((row, ri) => (
        <View key={`r-${ri}`} style={styles.row}>
          {row.map((cell, ci) => (
            <Cell key={`c-${ri}-${ci}`} filled={!!cell} colorKey={piece.kind} size={cellSize} />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grid,
    padding: 4,
    borderRadius: 8,
  },
  row: { flexDirection: 'row' },
});

