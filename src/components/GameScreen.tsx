import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Board as BoardComp } from '@/components/Board';
import { HUD } from '@/components/HUD';
import { COLORS } from '@/theme';
import { initGame, tick, tryMove, tryRotate } from '@/game/engine';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useInputLayer } from '@/hooks/useInput';
import { useLegacyResponder } from '@/hooks/useLegacyResponder';
import { ENABLE_GESTURES } from '@/config';
import { BOARD_COLS } from '@/game/constants';

export const GameScreen: React.FC = () => {
  const [state, setState] = useState(() => initGame());

  // 日本語: ゲームループ（1秒ごと）
  useGameLoop(
    useCallback(() => setState((s) => tick(s)), []),
    state.tickMs,
  );

  const onLeft = useCallback(() => setState((s) => tryMove(s, { row: 0, col: -1 })), []);
  const onRight = useCallback(() => setState((s) => tryMove(s, { row: 0, col: 1 })), []);
  const onRotate = useCallback(() => setState((s) => tryRotate(s)), []);
  const onSoftDrop = useCallback(() => setState((s) => tryMove(s, { row: 1, col: 0 })), []);

  const { Component: InputLayer } = useInputLayer({ onLeft, onRight, onRotate, onSoftDrop });
  const legacyHandlers = useLegacyResponder({ onLeft, onRight, onRotate, onSoftDrop });

  const { width } = Dimensions.get('window');
  const cellSize = useMemo(() => Math.floor((Math.min(width, 380) - 16) / BOARD_COLS), [width]);

  const onRestart = useCallback(() => setState(() => initGame()), []);

  return (
    <View style={styles.root}>
      <HUD score={state.score} next={state.nextPiece} isGameOver={state.isGameOver} />
      {ENABLE_GESTURES ? (
        <InputLayer>
        <View style={styles.boardWrap}>
          <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
        </View>
        </InputLayer>
      ) : (
        <View style={styles.boardWrap} {...legacyHandlers}>
          <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
        </View>
      )}
      <View style={styles.controls}>
        <Pressable accessibilityLabel="左へ" style={styles.btn} onPress={onLeft}>
          <Text style={styles.btnText}>←</Text>
        </Pressable>
        <Pressable accessibilityLabel="回転" style={styles.btn} onPress={onRotate}>
          <Text style={styles.btnText}>⟳</Text>
        </Pressable>
        <Pressable accessibilityLabel="右へ" style={styles.btn} onPress={onRight}>
          <Text style={styles.btnText}>→</Text>
        </Pressable>
        <Pressable accessibilityLabel="ソフトドロップ" style={[styles.btn, styles.accent]} onPress={onSoftDrop}>
          <Text style={[styles.btnText, styles.accentText]}>↓</Text>
        </Pressable>
      </View>
      {state.isGameOver && (
        <Pressable style={[styles.btn, styles.restart]} onPress={onRestart}>
          <Text style={styles.btnText}>再スタート</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 16,
    gap: 12,
  },
  boardWrap: { alignSelf: 'center' },
  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  btn: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  restart: { alignSelf: 'center', marginTop: 8 },
  btnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  accent: { backgroundColor: COLORS.accent },
  accentText: { color: '#0b1020' },
});
