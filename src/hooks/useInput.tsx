import { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ViewStyle } from 'react-native';

// 日本語: 入力ジェスチャーレイヤー。左右スワイプ、下スワイプ、タップを公開。
export type InputHandlers = {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
};

export function useInputLayer(
  handlers: InputHandlers,
  style?: ViewStyle,
): { Component: React.FC<React.PropsWithChildren> } {
  const pan = Gesture.Pan()
    .onEnd((e) => {
      const dx = e.translationX;
      const dy = e.translationY;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 16) handlers.onRight();
        else if (dx < -16) handlers.onLeft();
      } else if (dy > 16) {
        handlers.onSoftDrop();
      }
    })
    .minDistance(12);

  const tap = Gesture.Tap().onEnd(() => handlers.onRotate());
  const composed = Gesture.Simultaneous(pan, tap);

  const Component: React.FC<React.PropsWithChildren> = useCallback(
    ({ children }) => (
      <GestureDetector gesture={composed}>{children}</GestureDetector>
    ),
    [composed],
  );

  return { Component };
}

