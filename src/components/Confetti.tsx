import React from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { useEffect, useRef } from 'react';

const COLORS = ['#facc15', '#f472b6', '#60a5fa', '#34d399', '#fb7185', '#c084fc'];

const PIECE_COUNT = 18;

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

type AnimatedPiece = {
  translateY: Animated.Value;
  rotate: Animated.Value;
  translateX: number;
  size: number;
  color: string;
  delay: number;
  loop?: Animated.CompositeAnimation;
};

type Props = {
  visible: boolean;
  style?: ViewStyle;
};

export const Confetti: React.FC<Props> = ({ visible, style }) => {
  const piecesRef = useRef<AnimatedPiece[]>([]);

  if (piecesRef.current.length === 0) {
    piecesRef.current = Array.from({ length: PIECE_COUNT }, (_, idx) => ({
      translateY: new Animated.Value(-40),
      rotate: new Animated.Value(0),
      translateX: (Math.random() - 0.5) * SCREEN_WIDTH * 0.8,
      size: 6 + Math.random() * 8,
      color: COLORS[idx % COLORS.length],
      delay: Math.random() * 400,
    }));
  }

  const pieces = piecesRef.current;

  useEffect(() => {
    if (visible) {
      pieces.forEach((piece) => {
        piece.translateY.setValue(-40);
        piece.rotate.setValue(0);
        const fallDuration = 2600 + Math.random() * 1200;
        const loop = Animated.loop(
          Animated.sequence([
            Animated.delay(piece.delay),
            Animated.parallel([
              Animated.timing(piece.translateY, {
                toValue: SCREEN_HEIGHT + 60,
                duration: fallDuration,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(piece.rotate, {
                toValue: 1,
                duration: fallDuration,
                easing: Easing.linear,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(piece.translateY, {
              toValue: -40,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(piece.rotate, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
        piece.loop = loop;
        loop.start();
      });
    } else {
      pieces.forEach((piece) => {
        if (piece.loop) {
          piece.loop.stop();
          piece.loop = undefined;
        }
        piece.translateY.setValue(-40);
        piece.rotate.setValue(0);
      });
    }

    return () => {
      pieces.forEach((piece) => {
        if (piece.loop) {
          piece.loop.stop();
          piece.loop = undefined;
        }
      });
    };
  }, [visible, pieces]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {pieces.map((piece, idx) => {
        const rotate = piece.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });
        return (
          <Animated.View
            key={`confetti-${idx}`}
            pointerEvents="none"
            style={[
              styles.piece,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size * 2.2,
                transform: [
                  { translateX: piece.translateX },
                  { translateY: piece.translateY },
                  { rotate },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  piece: {
    position: 'absolute',
    borderRadius: 2,
    opacity: 0.85,
  },
});

export default Confetti;
