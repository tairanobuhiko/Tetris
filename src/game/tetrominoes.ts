import { PieceKind, Shape } from './types';

// 4x4 を基本にした回転用シェイプ
const SHAPES: Record<PieceKind, Shape> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

export function getInitialShape(kind: PieceKind): Shape {
  return SHAPES[kind].map((row) => row.slice());
}

export function rotateCW(shape: Shape): Shape {
  // 時計回り 90 度
  const rows = shape.length;
  if (rows === 0) return [];
  const cols = shape[0]!.length;
  const out: Shape = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const targetRow = out[c]!;
      targetRow[rows - 1 - r] = shape[r]?.[c] ?? 0;
    }
  }
  return out;
}

export function randomKind(): PieceKind {
  const kinds: PieceKind[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  return kinds[Math.floor(Math.random() * kinds.length)]!;
}
