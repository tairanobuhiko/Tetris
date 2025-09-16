import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Board as BoardType, FallingPiece } from '@/game/types';
import { COLORS, PIECE_COLORS } from '@/theme';
import { Cell } from './Cell';

type Props = {
  board: BoardType;
  piece: FallingPiece;
  cellSize: number;
};

export const Board: React.FC<Props> = ({ board, piece, cellSize }) => {
  // 表示用の合成（board + falling piece）。色は簡易的に kind で決定。
  const display = board.map((row) => row.slice());
  for (let r = 0; r < piece.shape.length; r++) {
    const rowShape = piece.shape[r];
    if (!rowShape) continue;
    for (let c = 0; c < rowShape.length; c++) {
      if (rowShape[c]) {
        const rr = piece.position.row + r;
        const cc = piece.position.col + c;
        const cols = display[0]?.length ?? 0;
        if (rr >= 0 && rr < display.length && cc >= 0 && cc < cols) {
          const targetRow = display[rr];
          if (targetRow) targetRow[cc] = 1;
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      {display.map((row, ri) => (
        <View key={`r-${ri}`} style={styles.row}>
          {row.map((cell, ci) => (
            <Cell
              key={`c-${ri}-${ci}`}
              filled={!!cell}
              colorKey={piece.kind as keyof typeof PIECE_COLORS}
              size={cellSize}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.grid,
    padding: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.outline,
    shadowColor: '#020617',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
  },
  row: { flexDirection: 'row' },
});
