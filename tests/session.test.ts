import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../src/game/config';
import { freshGame } from '../src/game/rules';
import { GameSession } from '../src/game/session';
describe('progression and undo', () => {
  it('undo restores board, tray, score and bricks exactly once while retaining best and sound', () => {
    const initial = freshGame(),
      game = new GameSession(initial);
    game.place(0, 7, 6);
    game.setSound(true);
    expect(game.undo()).toBe(true);
    expect(game.undo()).toBe(false);
    expect(game.state).toEqual({ ...initial, best: 120, sound: true });
  });
  it('a purchase spends bricks and invalidates undo so spent currency cannot be recovered', () => {
    const game = new GameSession(freshGame());
    game.place(0, 7, 6);
    expect(game.build()?.id).toBe('bakery');
    expect(game.state.bricks).toBe(0);
    expect(game.undo()).toBe(false);
    expect(game.build()).toBeNull();
    expect(game.state.built).toEqual(['bakery']);
  });
  it('cannot repeat the tutorial to farm bricks by restarting', () => {
    const game = new GameSession(freshGame());
    game.place(0, 7, 6);
    game.build();
    game.setSound(true);
    game.restart();
    expect(game.state).toMatchObject({
      bricks: 0,
      best: 120,
      score: 0,
      built: ['bakery'],
      sound: true,
      tutorial: false,
    });
    expect(game.state.board.flat().every((v) => v === null)).toBe(true);
    expect(game.canUndo).toBe(false);
  });
  it('rewards invalidate undo and cannot be undone or converted to negative balances', () => {
    const game = new GameSession(freshGame());
    game.place(0, 7, 6);
    game.grantReward(3);
    expect(game.state.bricks).toBe(6);
    expect(game.undo()).toBe(false);
    game.grantReward(-1);
    game.grantReward(0.5);
    expect(game.state.bricks).toBe(6);
  });
  it('refills a fully used tray and preserves non-mutated snapshots', () => {
    const game = new GameSession(freshGame(false), () => 0);
    const state = freshGame(false, () => 0);
    const deterministic = new GameSession(state, () => 0);
    deterministic.place(0, 0, 0);
    deterministic.place(1, 1, 0);
    deterministic.place(2, 2, 0);
    expect(deterministic.state.tray.every(Boolean)).toBe(true);
    const copy = game.state;
    copy.bricks = 999;
    expect(game.state.bricks).toBe(0);
  });
  it('never builds past the configured town and retains purchases after a reload', () => {
    const initial = freshGame();
    initial.bricks = 100;
    const game = new GameSession(initial);
    for (const project of PROJECTS) expect(game.build()?.id).toBe(project.id);
    const reloaded = new GameSession(game.state);
    expect(reloaded.build()).toBeNull();
    expect(reloaded.canUndo).toBe(false);
    expect(reloaded.state.bricks).toBe(47);
  });
  it('invalid placement does not destroy an available undo', () => {
    const game = new GameSession(freshGame());
    game.place(0, 7, 6);
    expect(game.place(1, -1, 0)).toBeNull();
    expect(game.canUndo).toBe(true);
  });
});
