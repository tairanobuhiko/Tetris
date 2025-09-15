import { BOARD_COLS, BOARD_ROWS, SCORE_TABLE } from './constants';
import { Board, FallingPiece, Position, Shape } from './types';

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0));
}

export function forEachCell(shape: Shape, pos: Position, cb: (r: number, c: number) => void) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) cb(pos.row + r, pos.col + c);
    }
  }
}

export function canPlace(board: Board, piece: FallingPiece, nextPos: Position): boolean {
  let ok = true;
  forEachCell(piece.shape, nextPos, (r, c) => {
    if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) {
      ok = false;
      return;
    }
    if (board[r][c] === 1) ok = false;
  });
  return ok;
}

export function mergePiece(board: Board, piece: FallingPiece): Board {
  const out = board.map((row) => row.slice());
  forEachCell(piece.shape, piece.position, (r, c) => {
    if (r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS) out[r][c] = 1;
  });
  return out;
}

export function clearFullLines(board: Board): { board: Board; cleared: number } {
  const remaining: Board = [];
  let cleared = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    const full = board[r].every((v) => v === 1);
    if (!full) remaining.push(board[r]);
    else cleared++;
  }
  while (remaining.length < BOARD_ROWS) {
    remaining.unshift(Array(BOARD_COLS).fill(0));
  }
  return { board: remaining, cleared };
}

export function scoreForLines(lines: number): number {
  return SCORE_TABLE[lines] ?? 0;
}

