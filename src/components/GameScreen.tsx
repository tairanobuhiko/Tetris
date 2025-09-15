import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Board as BoardComp } from '@/components/Board';
import { HUD } from '@/components/HUD';
import { COLORS } from '@/theme';
import { playMusic, stopMusic, stopAllSounds, stopFxOver, playGameOver, playLineClear } from '../audio/audio';
import { initGame, tick, tryMove, tryRotate } from '@/game/engine';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useInputLayer } from '@/hooks/useInput';
import { useLegacyResponder } from '@/hooks/useLegacyResponder';
import { ENABLE_GESTURES } from '../config';
import { BOARD_COLS } from '@/game/constants';

export const GameScreen: React.FC = () => {
  const [state, setState] = useState(() => initGame());
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  // ゲームループ（1秒ごと）
  useGameLoop(
    useCallback(() => {
      if (!paused && started) setState((s) => tick(s));
    }, [paused, started]),
    state.tickMs,
  );

  const onLeft = useCallback(() => {
    if (paused || state.isGameOver || !started) return;
    playMusic(true);
    setState((s) => tryMove(s, { row: 0, col: -1 }));
  }, [paused, started, state.isGameOver]);
  const onRight = useCallback(() => {
    if (paused || state.isGameOver || !started) return;
    playMusic(true);
    setState((s) => tryMove(s, { row: 0, col: 1 }));
  }, [paused, started, state.isGameOver]);
  const onRotate = useCallback(() => {
    if (paused || state.isGameOver || !started) return;
    playMusic(true);
    setState((s) => tryRotate(s));
  }, [paused, started, state.isGameOver]);
  const onSoftDrop = useCallback(
    () => {
      if (paused || state.isGameOver || !started) return;
      setState((s) => {
        playMusic(true);
        // ソフトドロップは速度をさらに上げる（4ステップ）
        let next = tryMove(s, { row: 1, col: 0 });
        for (let i = 0; i < 3; i++) next = tryMove(next, { row: 1, col: 0 });
        return next;
      });
    },
    [paused, started, state.isGameOver],
  );

  const onPauseToggle = useCallback(() => setPaused((p) => !p), []);

  const { Component: InputLayer } = useInputLayer({ onLeft, onRight, onRotate, onSoftDrop, onPause: onPauseToggle });
  const legacyHandlers = useLegacyResponder({ onLeft, onRight, onRotate, onSoftDrop, onPause: onPauseToggle });

  const win = useWindowDimensions();
  const [area, setArea] = useState({ w: 0, h: 0 });
  const cellSize = useMemo(() => {
    const byWidth = area.w > 0 ? Math.floor((area.w - 8) / BOARD_COLS) : Math.floor((Math.min(win.width, 380) - 16) / BOARD_COLS);
    const byHeight = area.h > 0 ? Math.floor((area.h - 8) / 20) : byWidth; // 20 行固定
    return Math.max(12, Math.min(byWidth, byHeight));
  }, [area.w, area.h, win.width]);

  const onRestart = useCallback(() => {
    setPaused(false);
    setStarted(true);
    setState(() => initGame());
    stopFxOver();
    playMusic(true);
  }, []);

  const onStart = useCallback(() => {
    setStarted(true);
    setPaused(false);
    setState(() => initGame());
    playMusic(true);
  }, []);
  const onContinue = useCallback(() => {
    setPaused(false);
  }, []);

  // アンマウント時にサウンド停止
  React.useEffect(() => {
    return () => {
      stopAllSounds();
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

  // ポーズ中はBGM停止、再開でBGM開始
  React.useEffect(() => {
    (async () => {
      if (paused) {
        await stopMusic();
      } else if (started && !state.isGameOver) {
        await playMusic(true);
      }
    })();
  }, [paused, started, state.isGameOver]);

  return (
    <View style={styles.root}>
      <HUD score={state.score} next={state.nextPiece} isGameOver={state.isGameOver} />
      {paused && (
        <Text style={{ color: COLORS.text, alignSelf: 'center' }}>一時停止中（2本指タップで再開）</Text>
      )}
      {!started && (
        <Pressable style={[styles.btn, styles.start]} onPress={onStart}>
          <Text style={styles.btnText}>スタート</Text>
        </Pressable>
      )}
      <View style={styles.boardArea} onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {ENABLE_GESTURES ? (
          <InputLayer>
            {state.isGameOver ? (
              <Pressable onPress={onRestart}>
                <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
              </Pressable>
            ) : !started ? (
              <View />
            ) : (
              <View>
                <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
              </View>
            )}
          </InputLayer>
        ) : state.isGameOver ? (
          <Pressable onPress={onRestart}>
            <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
          </Pressable>
        ) : !started ? (
          <View />
        ) : (
          <View {...legacyHandlers}>
            <BoardComp board={state.board} piece={state.currentPiece} cellSize={cellSize} />
          </View>
        )}
      </View>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel="左へ"
          style={[styles.btn, (paused||!started)?styles.btnDisabled:null]}
          onPress={onLeft}
          disabled={paused || !started}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Pressable
          accessibilityLabel="回転"
          style={[styles.btn, (paused||!started)?styles.btnDisabled:null]}
          onPress={onRotate}
          disabled={paused || !started}
        >
          <Ionicons name="refresh" size={24} color={COLORS.text} />
        </Pressable>
        <Pressable
          accessibilityLabel="右へ"
          style={[styles.btn, (paused||!started)?styles.btnDisabled:null]}
          onPress={onRight}
          disabled={paused || !started}
        >
          <Ionicons name="arrow-forward" size={24} color={COLORS.text} />
        </Pressable>
        <Pressable
          accessibilityLabel="ソフトドロップ"
          style={[styles.btn, styles.accent, (paused||!started)?styles.btnDisabled:null]}
          onPress={onSoftDrop}
          disabled={paused || !started}
        >
          <Ionicons name="arrow-down" size={24} color={'#0b1020'} />
        </Pressable>
        <Pressable
          accessibilityLabel={paused ? 'つづける' : 'ポーズ'}
          style={[styles.btn]}
          onPress={onPauseToggle}
        >
          <Ionicons name={paused ? 'play' : 'pause'} size={24} color={COLORS.text} />
        </Pressable>
      </View>
      {(state.isGameOver || paused) && (
        <View style={styles.bottomActions}>
          {paused && !state.isGameOver && (
            <Pressable style={[styles.btn, styles.restart]} onPress={onContinue}>
              <Text style={styles.btnText}>つづける</Text>
            </Pressable>
          )}
          <Pressable style={[styles.btn, styles.restart]} onPress={onRestart}>
            <Text style={styles.btnText}>さいしょから</Text>
          </Pressable>
        </View>
      )}

      {state.isGameOver && (
        <View pointerEvents="none" style={styles.overlay}>
          <Text style={styles.overTitle}>GAME OVER</Text>
          <Text style={styles.overScore}>最終スコア: {state.score}</Text>
          <Text style={styles.overHint}>タップでさいしょから</Text>
        </View>
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
    position: 'relative',
  },
  boardArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  boardWrap: { alignSelf: 'center' },
  controls: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  btn: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnDisabled: { opacity: 0.4 },
  start: { alignSelf: 'center' },
  restart: { alignSelf: 'center', marginTop: 8 },
  bottomActions: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 8 },
  btnText: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  accent: { backgroundColor: COLORS.accent },
  accentText: { color: '#0b1020' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    gap: 8,
  },
  overTitle: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  overScore: { color: COLORS.text, fontSize: 36, fontWeight: '900' },
  overHint: { color: COLORS.text, opacity: 0.85 },
});
