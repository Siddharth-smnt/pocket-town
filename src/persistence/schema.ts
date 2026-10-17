import { COLORS, PROJECTS, SHAPES, SIZE, TRAY_SIZE } from '../game/config';
import { orientations, shapeKey } from '../game/rules';
import type { GameState, Shape } from '../game/types';

const knownShapes = new Set(SHAPES.flatMap((s) => orientations(s).map(shapeKey)));
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const counter = (v: unknown): v is number =>
  typeof v === 'number' && Number.isSafeInteger(v) && v >= 0 && v <= 1_000_000_000_000;
const color = (v: unknown): boolean => typeof v === 'string' && COLORS.some((c) => c === v);
function validShape(value: unknown): value is Shape {
  if (!Array.isArray(value) || value.length < 2 || value.length > 4) return false;
  if (
    !value.every(
      (p) =>
        Array.isArray(p) &&
        p.length === 2 &&
        p.every((n) => Number.isInteger(n) && n >= 0 && n < 4),
    )
  )
    return false;
  const shape = value as Shape;
  return (
    new Set(shape.map((p) => p.join(','))).size === shape.length &&
    Math.min(...shape.map((p) => p[0])) === 0 &&
    Math.min(...shape.map((p) => p[1])) === 0 &&
    knownShapes.has(shapeKey(shape))
  );
}
export type Decoded =
  { kind: 'valid'; state: GameState; migrated: boolean } | { kind: 'invalid' | 'future' };
export function decodeSave(raw: string | null): Decoded {
  if (raw === null) return { kind: 'invalid' };
  try {
    const s: unknown = JSON.parse(raw);
    if (!record(s)) return { kind: 'invalid' };
    if (typeof s.version === 'number' && s.version > 2) return { kind: 'future' };
    if (s.version !== 1 && s.version !== 2) return { kind: 'invalid' };
    if (
      !Array.isArray(s.board) ||
      s.board.length !== SIZE ||
      !s.board.every(
        (r) => Array.isArray(r) && r.length === SIZE && r.every((v) => v === null || color(v)),
      )
    )
      return { kind: 'invalid' };
    if (
      !Array.isArray(s.tray) ||
      s.tray.length !== TRAY_SIZE ||
      !s.tray.some(Boolean) ||
      !s.tray.every((p) => p === null || (record(p) && color(p.color) && validShape(p.shape)))
    )
      return { kind: 'invalid' };
    if (!counter(s.score) || !counter(s.best) || !counter(s.bricks) || s.best < s.score)
      return { kind: 'invalid' };
    if (
      !Array.isArray(s.built) ||
      s.built.length > PROJECTS.length ||
      !s.built.every((id, i) => id === PROJECTS[i]?.id)
    )
      return { kind: 'invalid' };
    if (typeof s.sound !== 'boolean' || typeof s.tutorial !== 'boolean') return { kind: 'invalid' };
    // Copy only known fields; never let extra persisted properties enter the model.
    const state = {
      version: 2,
      board: s.board,
      tray: s.tray,
      score: s.score,
      best: s.best,
      bricks: s.bricks,
      built: s.built,
      sound: s.sound,
      tutorial: s.tutorial,
    } as GameState;
    return { kind: 'valid', state: structuredClone(state), migrated: s.version === 1 };
  } catch {
    return { kind: 'invalid' };
  }
}
