export type Cell = 0 | 1;
export type Board = Cell[][]; // 0 = 空, 1 = ブロック（色は別で管理）

export type Position = {
  row: number;
  col: number;
};

export type PieceKind = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Shape = number[][]; // 1/0 のマトリクス

export type FallingPiece = {
  kind: PieceKind;
  shape: Shape; // 現在の回転状態
  position: Position; // 左上起点
};

export type GameState = {
  board: Board;
  currentPiece: FallingPiece;
  nextPiece: FallingPiece;
  score: number;
  linesCleared: number;
  isGameOver: boolean;
  tickMs: number;
};

