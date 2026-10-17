import { ECONOMY, PROJECTS, SIZE } from '../game/config';
import { hasMoves } from '../game/rules';
import { GameSession } from '../game/session';
import type { GameState } from '../game/types';
import { SaveStore } from '../persistence/store';
import { GameAudio } from '../platform/audio';
import { exitGame, installLifecycle } from '../platform/lifecycle';
import type { RewardService } from '../platform/rewards';
import { element } from './dom';
import { installDrag } from './drag';
import { Renderer } from './renderer';

export async function mountGame(
  initial: GameState,
  saves: SaveStore,
  rewards: RewardService,
): Promise<void> {
  const session = new GameSession(initial),
    view = new Renderer(),
    audio = new GameAudio();
  let selected = initial.tray.findIndex(Boolean),
    busy = false,
    adBusy = false,
    paused = false;
  let toastTimer: ReturnType<typeof setTimeout> | undefined,
    hintTimer: ReturnType<typeof setTimeout> | undefined;
  const blocked = () => busy || adBusy || paused;
  const announce = (message: string) => {
    element('announcer').textContent = message;
  };
  function toast(message: string): void {
    clearTimeout(toastTimer);
    element('toast').textContent = message;
    element('toast').classList.add('show');
    toastTimer = setTimeout(() => element('toast').classList.remove('show'), 3500);
  }
  function render(newBuilding?: string): void {
    view.render(session.state, selected, session.canUndo, blocked(), newBuilding);
    element<HTMLButtonElement>('reward-ad').disabled = blocked();
  }
  const save = () => saves.save(session.state);
  function select(index: number): void {
    if (blocked() || !session.state.tray[index]) return;
    selected = index;
    view.clearPreview();
    render();
  }
  function rotate(): void {
    if (blocked() || !session.rotate(selected)) return;
    view.clearPreview();
    render();
    void save();
    audio.play('place', session.state.sound);
    announce('Selected block rotated.');
  }
  async function place(row: number, column: number): Promise<void> {
    if (blocked()) return;
    const before = session.state;
    const result = session.place(selected, row, column);
    if (!result) {
      toast('That space is a little snug. Try another spot or rotate.');
      return;
    }
    clearTimeout(hintTimer);
    view.clearPreview();
    busy = true;
    selected = session.state.tray.findIndex(Boolean);
    // Commit game state before visual effects, so backgrounding never loses a completed move.
    void save();
    render();
    if (result.lines) {
      view.board(result.placed);
      for (const [r, c] of result.cleared) view.cells[r * SIZE + c]!.classList.add('clearing');
      const pop = element('score-pop');
      pop.textContent = `${result.lines > 1 ? `${result.lines}-line combo!` : 'Lovely!'} +${result.bricks} bricks`;
      pop.classList.remove('show');
      void pop.offsetWidth;
      pop.classList.add('show');
      audio.play('clear', session.state.sound);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        await new Promise((resolve) => setTimeout(resolve, 350));
    } else audio.play('place', session.state.sound);
    busy = false;
    render();
    const current = session.state;
    announce(
      result.lines
        ? `${result.lines} line${result.lines === 1 ? '' : 's'} cleared. Earned ${result.bricks} bricks.`
        : `Block placed. ${current.score} points.`,
    );
    if (!hasMoves(current.board, current.tray)) {
      announce(`Puzzle complete. ${current.score} points. Your town is safe.`);
      if (!paused) element('restart-overlay').focus();
    }
    const project = PROJECTS[current.built.length];
    if (project && current.bricks >= project.cost && before.bricks < project.cost)
      toast(`${project.name} is ready to build!`);
  }
  function preview(row: number, column: number): void {
    if (!blocked()) view.preview(session.state, selected, row, column);
  }
  const cancelDrag = installDrag({
    piece: (index) => session.state.tray[index],
    select,
    preview,
    place: (r, c) => {
      void place(r, c);
    },
    clear: () => view.clearPreview(),
    blocked,
  });
  view.cells.forEach((cell, index) => {
    const row = Math.floor(index / SIZE),
      column = index % SIZE;
    cell.addEventListener('click', () => {
      void place(row, column);
    });
    cell.addEventListener('pointerenter', () => preview(row, column));
    cell.addEventListener('focus', () => preview(row, column));
    cell.addEventListener('keydown', (event) => {
      const deltas: Record<string, [number, number]> = {
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
      };
      const delta = deltas[event.key];
      if (delta) {
        event.preventDefault();
        view.focus(
          Math.max(0, Math.min(7, row + delta[0])),
          Math.max(0, Math.min(7, column + delta[1])),
        );
      }
      if (event.key.toLowerCase() === 'r') rotate();
    });
  });
  element('board').addEventListener('pointerleave', () => view.clearPreview());
  element('tray').addEventListener('click', (event) => {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-index]');
    if (target && !target.disabled) select(Number(target.dataset.index));
  });
  element('rotate').addEventListener('click', rotate);
  element('hint').addEventListener('click', () => {
    if (blocked()) return;
    clearTimeout(hintTimer);
    const hint = session.hint(selected);
    if (!hint) {
      toast('Time for a fresh puzzle. Your town is safe.');
      return;
    }
    selected = hint.index;
    render();
    view.clearPreview();
    for (const [r, c] of hint.shape)
      view.cells[(r + hint.row) * SIZE + c + hint.column]!.classList.add('hint-cell');
    const message = `Try row ${hint.row + 1}, column ${hint.column + 1} with this block.`;
    element('move-hint').textContent = message;
    announce(message);
    hintTimer = setTimeout(() => view.clearPreview(), 5000);
    void save();
  });
  element('undo').addEventListener('click', () => {
    if (blocked() || !session.undo()) return;
    cancelDrag();
    clearTimeout(hintTimer);
    selected = session.state.tray.findIndex(Boolean);
    render();
    void save();
    toast('One little step back. Try a new move.');
  });
  function restart(): void {
    if (blocked()) return;
    cancelDrag();
    clearTimeout(hintTimer);
    session.restart();
    selected = 0;
    render();
    void save();
    view.focus(0, 0);
    toast('A fresh board. Your town, bricks and best score are safe.');
  }
  const restartDialog = element<HTMLDialogElement>('restart-dialog');
  const askRestart = () => {
    if (blocked()) return;
    if (session.state.score > 0 && hasMoves(session.state.board, session.state.tray))
      restartDialog.showModal();
    else restart();
  };
  element('restart').addEventListener('click', askRestart);
  element('restart-overlay').addEventListener('click', restart);
  element('cancel-restart').addEventListener('click', () => restartDialog.close());
  element('confirm-restart').addEventListener('click', () => {
    restartDialog.close();
    restart();
  });
  element('build').addEventListener('click', () => {
    if (blocked()) return;
    const project = session.build();
    if (!project) return;
    render(project.id);
    void save();
    audio.play('build', session.state.sound);
    toast(`${project.name} is open. Welcome to the neighbourhood!`);
    announce(`${project.name} built. ${session.state.built.length + 1} places in your town.`);
  });
  element('sound').addEventListener('click', () => {
    session.setSound(!session.state.sound);
    render();
    void save();
    audio.play('clear', session.state.sound);
  });
  const help = element<HTMLDialogElement>('help-dialog');
  element('help').addEventListener('click', () => help.showModal());
  element('close-help').addEventListener('click', () => help.close());
  element('lets-play').addEventListener('click', () => help.close());
  element('reward-container').classList.toggle('hidden', !rewards.available);
  element('reward-ad').addEventListener('click', async () => {
    if (blocked()) return;
    adBusy = true;
    cancelDrag();
    render();
    element('reward-ad').textContent = 'Opening test ad…';
    const result = await rewards.show(() => {
      session.grantReward(ECONOMY.testAdBricks);
      void save();
      render();
    });
    adBusy = false;
    render();
    element('reward-ad').textContent = `Watch a test ad · +${ECONOMY.testAdBricks} bricks`;
    toast(
      result === 'rewarded'
        ? `Thank you! ${ECONOMY.testAdBricks} bricks added.`
        : result === 'closed'
          ? 'Ad closed. No bricks added.'
          : 'An ad is unavailable. You can keep playing.',
    );
  });
  const exitDialog = element<HTMLDialogElement>('exit-dialog');
  element('cancel-exit').addEventListener('click', () => exitDialog.close());
  element('confirm-exit').addEventListener('click', async () => {
    exitDialog.close();
    await saves.flush();
    await exitGame();
  });
  function pause(): void {
    paused = true;
    cancelDrag();
    audio.pause();
    void saves.flush();
    render();
  }
  function resume(): void {
    paused = false;
    render();
  }
  render();
  try {
    await installLifecycle(pause, resume, () => {
      for (const dialog of [help, restartDialog, exitDialog])
        if (dialog.open) {
          dialog.close();
          return;
        }
      exitDialog.showModal();
    });
  } catch {
    toast('Device navigation could not be connected. Use the on-screen controls.');
  }
}
