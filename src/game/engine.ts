import { BOARD_COLS, INITIAL_TICK_MS } from './constants';
import { createEmptyBoard, canPlace, mergePiece, clearFullLines } from './board';
import { getInitialShape, randomKind, rotateCW } from './tetrominoes';
import { FallingPiece, GameState, PieceKind, Position } from './types';

function spawnPiece(): FallingPiece {
  const kind: PieceKind = randomKind();
  const shape = getInitialShape(kind);
  const firstRow = shape[0] ?? [];
  const position: Position = { row: 0, col: Math.floor((BOARD_COLS - firstRow.length) / 2) };
  return { kind, shape, position };
}

export function initGame(): GameState {
  // 初期化（最初のピースと次ピースを準備）
  const currentPiece = spawnPiece();
  const nextPiece = spawnPiece();
  return {
    board: createEmptyBoard(),
    currentPiece,
    nextPiece,
    score: 0,
    linesCleared: 0,
    isGameOver: false,
    tickMs: INITIAL_TICK_MS,
    startAt: Date.now(),
  };
}

export function tryMove(state: GameState, delta: Position): GameState {
  if (state.isGameOver) return state;
  const nextPos = {
    row: state.currentPiece.position.row + (delta.row ?? 0),
    col: state.currentPiece.position.col + (delta.col ?? 0),
  };
  if (canPlace(state.board, state.currentPiece, nextPos)) {
    return { ...state, currentPiece: { ...state.currentPiece, position: nextPos } };
  }
  return state;
}

export function tryRotate(state: GameState): GameState {
  if (state.isGameOver) return state;
  const rotated = rotateCW(state.currentPiece.shape);
  const rotatedPiece: FallingPiece = { ...state.currentPiece, shape: rotated };
  if (canPlace(state.board, rotatedPiece, rotatedPiece.position)) {
    return { ...state, currentPiece: rotatedPiece };
  }
  // 壁蹴り（簡易）- 左右に1マスずらして試す
  for (const dx of [-1, 1]) {
    const pos = { ...rotatedPiece.position, col: rotatedPiece.position.col + dx };
    if (canPlace(state.board, rotatedPiece, pos)) {
      return { ...state, currentPiece: { ...rotatedPiece, position: pos } };
    }
  }
  return state;
}

export function tick(state: GameState): GameState {
  if (state.isGameOver) return state;
  const moved = tryMove(state, { row: 1, col: 0 });
  // 動けなければ着地
  if (moved === state) {
    const merged = mergePiece(state.board, state.currentPiece);
    const { board, cleared } = clearFullLines(merged);
    const scoreTable = [0, 100, 300, 500, 800] as const;
    const scoreGain = cleared > 0 ? Math.max(0, scoreTable[cleared] ?? 0) : 0;
    const next = state.nextPiece;
    const spawn: GameState = {
      ...state,
      board,
      score: state.score + scoreGain,
      linesCleared: state.linesCleared + cleared,
      currentPiece: next,
      nextPiece: spawnPiece(),
    };
    // 生成位置で衝突したらゲームオーバー
    if (!canPlace(spawn.board, spawn.currentPiece, spawn.currentPiece.position)) {
      return { ...spawn, isGameOver: true };
    }
    return applyDifficulty(spawn);
  }
  return applyDifficulty(moved);
}

function applyDifficulty(s: GameState): GameState {
  // 30秒ごとに 75ms 短縮、下限200ms
  const elapsed30s = Math.floor((Date.now() - s.startAt) / 30000);
  const faster = Math.max(200, INITIAL_TICK_MS - elapsed30s * 75);
  return s.tickMs === faster ? s : { ...s, tickMs: faster };
}
