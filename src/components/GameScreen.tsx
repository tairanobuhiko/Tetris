import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
const { Ionicons } = require('@expo/vector-icons');
import { Board as BoardComp } from '@/components/Board';
import { HUD } from '@/components/HUD';
import { COLORS } from '@/theme';
import { SettingsModal } from '@/components/SettingsModal';
import { useSettings } from '@/state/settings';
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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { bgmTrackId, changeBgmTrack } = useSettings();

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
  const headerWidth = useMemo(() => {
    const available = Math.max(win.width - 40, 0);
    if (available <= 0) return win.width;
    const desired = Math.min(win.width * 0.8, 420);
    const minPreferred = Math.min(available, 260);
    return Math.max(Math.min(desired, available), minPreferred);
  }, [win.width]);
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

  const onOpenSettings = useCallback(() => {
    if (!started || paused) setSettingsVisible(true);
  }, [paused, started]);
  const onCloseSettings = useCallback(() => setSettingsVisible(false), []);
  const onSelectBgm = useCallback(
    async (id: string) => {
      await changeBgmTrack(id);
    },
    [changeBgmTrack],
  );

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
      <View pointerEvents="none" style={styles.glowPrimary} />
      <View pointerEvents="none" style={styles.glowSecondary} />
      <View style={[styles.headerWrapper, { width: headerWidth }]}>
        <HUD
          score={state.score}
          next={state.nextPiece}
          isGameOver={state.isGameOver}
          showSettingsButton={!started || paused}
          onPressSettings={onOpenSettings}
        />
      </View>
      {paused && (
        <Text style={styles.pauseLabel}>一時停止中（2本指タップで再開）</Text>
      )}
      {!started && (
        <Pressable style={[styles.btn, styles.start]} onPress={onStart}>
          <Text style={styles.btnText}>スタート</Text>
        </Pressable>
      )}
      <View
        style={styles.boardArea}
        onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
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
      <SettingsModal
        visible={settingsVisible}
        onClose={onCloseSettings}
        onSelectBgm={onSelectBgm}
        selectedBgmId={bgmTrackId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
    gap: 12,
    position: 'relative',
  },
  glowPrimary: {
    position: 'absolute',
    width: 260,
    height: 260,
    backgroundColor: 'rgba(59,130,246,0.28)',
    borderRadius: 200,
    top: -80,
    right: -60,
  },
  glowSecondary: {
    position: 'absolute',
    width: 220,
    height: 220,
    backgroundColor: 'rgba(56,189,248,0.18)',
    borderRadius: 200,
    bottom: -70,
    left: -40,
  },
  headerWrapper: { alignSelf: 'center', marginBottom: 14 },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    paddingTop: 12,
  },
  boardWrap: { alignSelf: 'center' },
  controls: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 16 },
  btn: {
    backgroundColor: 'rgba(148,163,184,0.16)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.26)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  btnDisabled: { opacity: 0.4 },
  start: { alignSelf: 'center' },
  restart: { alignSelf: 'center', marginTop: 8 },
  bottomActions: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 8 },
  btnText: { color: COLORS.text, fontSize: 18, fontWeight: '700', letterSpacing: 1.1 },
  accent: {
    backgroundColor: COLORS.accent,
    borderColor: 'rgba(14,165,233,0.45)',
  },
  accentText: { color: '#0b1020' },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.78)',
    gap: 10,
  },
  overTitle: { color: COLORS.text, fontSize: 30, fontWeight: '800', letterSpacing: 8 },
  overScore: { color: COLORS.text, fontSize: 34, fontWeight: '900' },
  overHint: { color: COLORS.text, opacity: 0.85, fontSize: 16 },
  pauseLabel: {
    color: COLORS.text,
    alignSelf: 'center',
    fontSize: 16,
    backgroundColor: 'rgba(15,23,42,0.6)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.24)',
    marginBottom: 10,
  },
});
