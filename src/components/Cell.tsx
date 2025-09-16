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
  const borderColor = filled ? 'rgba(15,23,42,0.85)' : 'rgba(148,163,184,0.14)';
  return (
    <View
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderColor,
          shadowOpacity: filled ? 0.45 : 0.15,
        },
      ]}
    />
  );
});

const styles = StyleSheet.create({
  cell: {
    borderRadius: 6,
    margin: 1.5,
    borderWidth: 1,
    shadowColor: '#020617',
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
