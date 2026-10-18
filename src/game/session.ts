import { PROJECTS } from './config';
import { applyMove, findHint, freshGame, makeTray, rotate } from './rules';
import type { GameState, Hint, MoveResult, Project } from './types';

/** Owns atomic game actions. UI only receives copies, never mutable internal state. */
export class GameSession {
  private current: GameState;
  private previous: GameState | null = null;
  constructor(
    state: GameState,
    private readonly random: () => number = Math.random,
  ) {
    this.current = structuredClone(state);
  }
  get state(): GameState {
    return structuredClone(this.current);
  }
  get canUndo(): boolean {
    return this.previous !== null;
  }
  place(index: number, row: number, column: number): MoveResult | null {
    const result = applyMove(this.current.board, this.current.tray[index], row, column);
    if (!result) return null;
    this.previous = this.state;
    const tray = structuredClone(this.current.tray);
    tray[index] = null;
    const score = this.current.score + result.points;
    this.current = {
      ...this.current,
      board: result.board,
      tray: tray.some(Boolean) ? tray : makeTray(this.random),
      score,
      best: Math.max(score, this.current.best),
      bricks: this.current.bricks + result.bricks,
      tutorial: false,
    };
    return result;
  }
  rotate(index: number): boolean {
    const piece = this.current.tray[index];
    if (!piece) return false;
    piece.shape = rotate(piece.shape);
    return true;
  }
  hint(preferred = -1): Hint | null {
    const hint = findHint(this.current.board, this.current.tray, preferred);
    if (hint) this.current.tray[hint.index]!.shape = structuredClone(hint.shape);
    return hint;
  }
  undo(): boolean {
    if (!this.previous) return false;
    this.current = { ...this.previous, best: this.current.best, sound: this.current.sound };
    this.previous = null;
    return true;
  }
  build(): Project | null {
    const project = PROJECTS[this.current.built.length];
    if (!project || this.current.bricks < project.cost) return null;
    this.current = {
      ...this.current,
      bricks: this.current.bricks - project.cost,
      built: [...this.current.built, project.id],
    };
    this.previous = null;
    return project;
  }
  restart(): void {
    const { best, bricks, built, sound } = this.current;
    this.current = { ...freshGame(false, this.random), best, bricks, built, sound };
    this.previous = null;
  }
  setSound(enabled: boolean): void {
    this.current.sound = enabled;
  }
  grantReward(bricks: number): void {
    if (!Number.isSafeInteger(bricks) || bricks <= 0) return;
    this.current.bricks += bricks;
    this.previous = null;
  }
}
