import { useCallback, type FC, type PropsWithChildren } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ViewStyle } from 'react-native';

// 入力ジェスチャーレイヤー。左右スワイプ、下スワイプ、タップを公開。
export type InputHandlers = {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onPause?: () => void; // ダブルタップでポーズ
};

export function useInputLayer(
  handlers: InputHandlers,
  style?: ViewStyle,
): { Component: FC<PropsWithChildren> } {
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
  const two = Gesture.Tap().minPointers(2).onEnd(() => handlers.onPause?.());
  const composed = Gesture.Race(two, Gesture.Simultaneous(pan, tap));

  const Component: FC<PropsWithChildren> = useCallback(
    ({ children }) => (
      <GestureDetector gesture={composed}>{children}</GestureDetector>
    ),
    [composed],
  );

  return { Component };
}
