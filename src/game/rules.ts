import { COLORS, ECONOMY, SHAPES, SIZE, TRAY_SIZE } from './config';
import type { Board, Coordinate, GameState, Hint, MoveResult, Piece, Shape, Tray } from './types';

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
}
export function normalize(shape: Shape): Shape {
  const minRow = Math.min(...shape.map(([r]) => r));
  const minCol = Math.min(...shape.map(([, c]) => c));
  return shape.map(([r, c]) => [r - minRow, c - minCol]);
}
export function rotate(shape: Shape): Shape {
  const height = Math.max(...shape.map(([r]) => r));
  return normalize(shape.map(([r, c]) => [c, height - r]));
}
export function shapeKey(shape: Shape): string {
  return normalize(shape)
    .map(([r, c]) => `${r},${c}`)
    .sort()
    .join(';');
}
export function orientations(shape: Shape): Shape[] {
  const results: Shape[] = [];
  let next = shape;
  for (let n = 0; n < 4; n++) {
    if (!results.some((s) => shapeKey(s) === shapeKey(next))) results.push(next);
    next = rotate(next);
  }
  return results;
}
export function fits(board: Board, shape: Shape, row: number, column: number): boolean {
  if (!Number.isInteger(row) || !Number.isInteger(column) || !shape.length) return false;
  return shape.every(([r, c]) => {
    const rr = row + r,
      cc = column + c;
    return rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE && board[rr]?.[cc] === null;
  });
}
export function placements(board: Board, shape: Shape): Coordinate[] {
  const result: Coordinate[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (fits(board, shape, r, c)) result.push([r, c]);
  return result;
}
export function hasMoves(board: Board, tray: Tray): boolean {
  return tray.some(
    (piece) =>
      piece && orientations(piece.shape).some((shape) => placements(board, shape).length > 0),
  );
}
export function makeTray(random: () => number = Math.random): Tray {
  return Array.from({ length: TRAY_SIZE }, () => ({
    shape: structuredClone(
      SHAPES[Math.min(SHAPES.length - 1, Math.floor(random() * SHAPES.length))]!,
    ),
    color: COLORS[Math.min(COLORS.length - 1, Math.floor(random() * COLORS.length))]!,
  }));
}
export function freshGame(tutorial = true, random: () => number = Math.random): GameState {
  const board = emptyBoard();
  if (tutorial) {
    for (let c = 0; c < 6; c++) board[7]![c] = 'mint';
    board[5]![0] = 'gold';
    board[5]![1] = 'gold';
    board[6]![0] = 'gold';
    board[3]![6] = 'purple';
    board[3]![7] = 'purple';
  }
  return {
    version: 2,
    board,
    tray: tutorial
      ? [
          {
            shape: [
              [0, 0],
              [0, 1],
            ],
            color: 'blue',
          },
          {
            shape: [
              [0, 0],
              [1, 0],
              [1, 1],
            ],
            color: 'coral',
          },
          {
            shape: [
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 1],
            ],
            color: 'gold',
          },
        ]
      : makeTray(random),
    score: 0,
    best: 0,
    bricks: 0,
    built: [],
    sound: false,
    tutorial,
  };
}
export function applyMove(
  board: Board,
  piece: Piece | null | undefined,
  row: number,
  column: number,
): MoveResult | null {
  if (!piece || !fits(board, piece.shape, row, column)) return null;
  const placed = board.map((r) => [...r]);
  for (const [r, c] of piece.shape) placed[row + r]![column + c] = piece.color;
  const rows: number[] = [],
    cols: number[] = [];
  // Detect both axes before removing any cell, so crossing lines clear together.
  for (let n = 0; n < SIZE; n++) {
    if (placed[n]!.every(Boolean)) rows.push(n);
    if (placed.every((r) => Boolean(r[n]))) cols.push(n);
  }
  const cleared: Coordinate[] = [];
  const next = placed.map((r) => [...r]);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (rows.includes(r) || cols.includes(c)) {
        cleared.push([r, c]);
        next[r]![c] = null;
      }
    }
  const lines = rows.length + cols.length;
  return {
    board: next,
    placed,
    cleared,
    lines,
    points:
      piece.shape.length * ECONOMY.pointsPerSquare +
      lines * ECONOMY.pointsPerLine +
      (lines > 1 ? lines * ECONOMY.comboPointsPerLine : 0),
    bricks:
      lines * ECONOMY.bricksPerLine + Math.max(0, lines - 1) * ECONOMY.comboBricksPerExtraLine,
  };
}
export function findHint(board: Board, tray: Tray, preferred = -1): Hint | null {
  const order = [preferred, ...tray.map((_, i) => i).filter((i) => i !== preferred)];
  for (const index of order) {
    const piece = tray[index];
    if (!piece) continue;
    let best: Hint | null = null,
      bestPoints = -1;
    for (const shape of orientations(piece.shape))
      for (const [row, column] of placements(board, shape)) {
        const result = applyMove(board, { ...piece, shape }, row, column)!;
        if (result.points > bestPoints) {
          bestPoints = result.points;
          best = { index, shape, row, column };
        }
      }
    if (best) return best;
  }
  return null;
}
