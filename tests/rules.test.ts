import { describe, expect, it } from 'vitest';
import { SHAPES } from '../src/game/config';
import {
  applyMove,
  emptyBoard,
  findHint,
  fits,
  freshGame,
  hasMoves,
  rotate,
  shapeKey,
} from '../src/game/rules';
import type { Piece } from '../src/game/types';
const domino: Piece = {
  shape: [
    [0, 0],
    [0, 1],
  ],
  color: 'blue',
};
describe('puzzle rules', () => {
  it('rejects overlaps, negative, out-of-bounds and fractional origins without mutation', () => {
    const board = emptyBoard();
    board[0]![0] = 'mint';
    const before = structuredClone(board);
    for (const [r, c] of [
      [0, 0],
      [-1, 0],
      [0, 7],
      [8, 0],
      [0, 0.5],
    ])
      expect(applyMove(board, domino, r!, c!)).toBeNull();
    expect(board).toEqual(before);
    expect(fits(board, domino.shape, 1, 0)).toBe(true);
  });
  it('clears a crossing row and column simultaneously and counts the intersection once', () => {
    const board = emptyBoard();
    for (let i = 0; i < 8; i++) {
      board[7]![i] = 'mint';
      board[i]![7] = 'mint';
    }
    board[7]![6] = null;
    board[7]![7] = null;
    const result = applyMove(board, domino, 7, 6)!;
    expect(result.lines).toBe(2);
    expect(result.cleared).toHaveLength(15);
    expect(result.points).toBe(270);
    expect(result.bricks).toBe(7);
    expect(result.board.flat().every((cell) => cell === null)).toBe(true);
    expect(board[7]![6]).toBeNull();
  });
  it('keeps a partially filled line and scores only placed squares', () => {
    const result = applyMove(emptyBoard(), domino, 0, 0)!;
    expect(result.lines).toBe(0);
    expect(result.points).toBe(20);
    expect(result.bricks).toBe(0);
    expect(result.board[0]!.slice(0, 3)).toEqual(['blue', 'blue', null]);
  });
  it('rotates every supported shape through four turns without changing it', () => {
    for (const shape of SHAPES) {
      let turned = shape;
      for (let i = 0; i < 4; i++) turned = rotate(turned);
      expect(shapeKey(turned)).toBe(shapeKey(shape));
    }
  });
  it('detects a move and supplies a hint when only a rotated piece fits', () => {
    const board = emptyBoard().map((row) => row.map(() => 'mint' as const));
    const editable = board as ReturnType<typeof emptyBoard>;
    editable[2]![3] = null;
    editable[3]![3] = null;
    expect(fits(editable, domino.shape, 2, 3)).toBe(false);
    expect(hasMoves(editable, [domino, null, null])).toBe(true);
    const hint = findHint(editable, [domino, null, null])!;
    expect(hint.row).toBe(2);
    expect(hint.column).toBe(3);
    expect(fits(editable, hint.shape, hint.row, hint.column)).toBe(true);
    editable[3]![3] = 'mint';
    expect(hasMoves(editable, [domino, null, null])).toBe(false);
  });
  it('gives exactly the bakery cost from the opening move', () => {
    const state = freshGame();
    const result = applyMove(state.board, state.tray[0], 7, 6)!;
    expect(result.lines).toBe(1);
    expect(result.bricks).toBe(3);
    expect(result.points).toBe(120);
  });
});
