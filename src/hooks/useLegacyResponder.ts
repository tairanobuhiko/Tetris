import { useMemo } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderInstance } from 'react-native';

export type LegacyHandlers = {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onPause?: () => void; // ダブルタップでポーズ
};

// RNGH を使わず、標準の PanResponder で簡易ジェスチャ。
export function useLegacyResponder({ onLeft, onRight, onRotate, onSoftDrop, onPause }: LegacyHandlers): PanResponderInstance['panHandlers'] {
  let startX = 0;
  let startY = 0;
  let moved = false;
  let lastTap = 0;

  const responder: PanResponderInstance = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          startX = e.nativeEvent.locationX;
          startY = e.nativeEvent.locationY;
          moved = false;
          // 2本指タップでポーズ
          const touches = (e.nativeEvent as any).touches;
          if (Array.isArray(touches) && touches.length >= 2) {
            onPause?.();
          }
        },
        onPanResponderMove: (e, g) => {
          // 閾値
          const dx = g.dx;
          const dy = g.dy;
          if (Math.abs(dx) > 24 || Math.abs(dy) > 24) moved = true;
        },
        onPanResponderRelease: (e, g) => {
          const dx = g.dx;
          const dy = g.dy;
          const adx = Math.abs(dx);
          const ady = Math.abs(dy);
          // シングルタップは回転
          if (!moved || (adx < 16 && ady < 16)) {
            onRotate();
            return;
          }
          if (adx > ady) {
            if (dx > 16) onRight();
            else if (dx < -16) onLeft();
          } else {
            if (dy > 16) onSoftDrop();
          }
        },
      }),
    [onLeft, onRight, onRotate, onSoftDrop],
  );

  return responder.panHandlers;
}
