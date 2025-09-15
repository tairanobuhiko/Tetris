import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Board as BoardComp } from '@/components/Board';
import { HUD } from '@/components/HUD';
import { COLORS } from '@/theme';
import { playMusic, stopMusic, pauseMusic, resumeMusic, playGameOver, playLineClear } from '../audio/audio';
import { initGame, tick, tryMove, tryRotate } from '@/game/engine';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useInputLayer } from '@/hooks/useInput';
import { useLegacyResponder } from '@/hooks/useLegacyResponder';
import { ENABLE_GESTURES } from '../config';
import { BOARD_COLS } from '@/game/constants';

export const GameScreen: React.FC = () => {
  const [state, setState] = useState(() => initGame());
  const [paused, setPaused] = useState(false);

  // ゲームループ（1秒ごと）
  useGameLoop(
    useCallback(() => {
      if (!paused) setState((s) => tick(s));
    }, [paused]),
    state.tickMs,
  );

  const onLeft = useCallback(() => {
    playMusic(true);
    setState((s) => tryMove(s, { row: 0, col: -1 }));
  }, []);
  const onRight = useCallback(() => {
    playMusic(true);
    setState((s) => tryMove(s, { row: 0, col: 1 }));
  }, []);
  const onRotate = useCallback(() => {
    playMusic(true);
    setState((s) => tryRotate(s));
  }, []);
  const onSoftDrop = useCallback(
    () =>
      setState((s) => {
        playMusic(true);
        // ソフトドロップは速度を上げる（2ステップ試行）
        let next = tryMove(s, { row: 1, col: 0 });
        next = tryMove(next, { row: 1, col: 0 });
        return next;
      }),
    [],
  );

  const onPauseToggle = useCallback(() => setPaused((p) => !p), []);

  const { Component: InputLayer } = useInputLayer({ onLeft, onRight, onRotate, onSoftDrop, onPause: onPauseToggle });
  const legacyHandlers = useLegacyResponder({ onLeft, onRight, onRotate, onSoftDrop, onPause: onPauseToggle });

  const { width } = Dimensions.get('window');
  const cellSize = useMemo(() => Math.floor((Math.min(width, 380) - 16) / BOARD_COLS), [width]);

  const onRestart = useCallback(() => {
    setState(() => initGame());
    playMusic(true);
  }, []);

  // BGM と効果音
  React.useEffect(() => {
    playMusic(true);
    return () => {
      stopMusic();
    };
  }, []);

  // ライン消去で効果音
  const prevLines = React.useRef(state.linesCleared);
  React.useEffect(() => {
    if (state.linesCleared > prevLines.current) {
      playLineClear();
      prevLines.current = state.linesCleared;
    }
  }, [state.linesCleared]);

  // ゲームオーバーでBGM停止＋効果音
  React.useEffect(() => {
    if (state.isGameOver) {
      stopMusic();
      playGameOver();
    }
  }, [state.isGameOver]);

  // ポーズ中はBGMも一時停止
  React.useEffect(() => {
    if (paused) pauseMusic();
    else resumeMusic();
  }, [paused]);

  return (
    <View style={styles.root}>
      <HUD score={state.score} next={state.nextPiece} isGameOver={state.isGameOver} />
      {paused && <Text style={{ color: COLORS.text, alignSelf: 'center' }}>一時停止中（ダブルタップで再開）</Text>}
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
