import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, PIECE_COLORS } from '@/theme';

type Props = {
  filled: boolean;
  colorKey?: keyof typeof PIECE_COLORS;
  size: number;
};

export const Cell: React.FC<Props> = React.memo(({ filled, colorKey, size }) => {
  const bg = filled && colorKey ? PIECE_COLORS[colorKey] : COLORS.cell;
  return <View style={[styles.cell, { width: size, height: size, backgroundColor: bg }]} />;
});

const styles = StyleSheet.create({
  cell: {
    borderRadius: 4,
    margin: 1,
  },
});

