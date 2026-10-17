import { PROJECTS, SIZE } from '../game/config';
import { fits, hasMoves } from '../game/rules';
import type { Board, GameState, Piece } from '../game/types';
import { element, icon } from './dom';
import { buildingIcon, townSVG } from './town';

export function shapeHTML(piece: Piece): string {
  const width = Math.max(...piece.shape.map(([, c]) => c)) + 1;
  const height = Math.max(...piece.shape.map(([r]) => r)) + 1;
  return `<div class="piece-shape" style="grid-template-columns:repeat(${width},1fr);grid-template-rows:repeat(${height},1fr)">${piece.shape.map(([r, c]) => `<i class="tile ${piece.color}" style="grid-row:${r + 1};grid-column:${c + 1}"></i>`).join('')}</div>`;
}
export class Renderer {
  readonly cells: HTMLButtonElement[] = [];
  private builtSignature = '';
  constructor() {
    for (let r = 0; r < SIZE; r++) {
      const row = document.createElement('div');
      row.className = 'board-row';
      row.setAttribute('role', 'row');
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.setAttribute('role', 'gridcell');
        cell.tabIndex = r === 0 && c === 0 ? 0 : -1;
        this.cells.push(cell);
        row.append(cell);
      }
      element('board').append(row);
    }
  }
  board(board: Board, tutorial = false): void {
    this.cells.forEach((cell, index) => {
      const r = Math.floor(index / SIZE),
        c = index % SIZE,
        value = board[r]![c];
      cell.className = `cell${value ? ' occupied ' + value : ''}`;
      cell.removeAttribute('style');
      cell.setAttribute(
        'aria-label',
        `Row ${r + 1}, column ${c + 1}, ${value ? 'occupied' : 'empty'}`,
      );
      if (tutorial && r === 7 && c >= 6 && !value) cell.classList.add('guide');
    });
  }
  clearPreview(): void {
    for (const cell of this.cells) {
      cell.classList.remove('preview', 'invalid', 'hint-cell');
      cell.style.removeProperty('--tile-color');
    }
  }
  preview(state: GameState, index: number, r: number, c: number): void {
    this.clearPreview();
    const piece = state.tray[index];
    if (!piece) return;
    const valid = fits(state.board, piece.shape, r, c);
    for (const [dr, dc] of piece.shape) {
      const rr = r + dr,
        cc = c + dc;
      if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) {
        const cell = this.cells[rr * SIZE + cc]!;
        cell.classList.add(valid ? 'preview' : 'invalid');
        cell.style.setProperty('--tile-color', `var(--${piece.color})`);
      }
    }
  }
  focus(r: number, c: number): void {
    this.cells.forEach((cell) => {
      cell.tabIndex = -1;
    });
    const cell = this.cells[r * SIZE + c]!;
    cell.tabIndex = 0;
    cell.focus();
  }
  render(
    state: GameState,
    selected: number,
    canUndo: boolean,
    busy: boolean,
    newBuilding?: string,
  ): void {
    this.board(state.board, state.tutorial);
    element('tray').innerHTML = state.tray
      .map(
        (piece, index) =>
          `<button type="button" class="piece-slot${index === selected ? ' selected' : ''}" data-index="${index}" aria-pressed="${index === selected}" aria-label="Block ${index + 1}${piece ? `: ${piece.shape.length} squares. Select or drag to place.` : ' placed'}"${!piece || busy ? ' disabled' : ''}>${piece ? shapeHTML(piece) : `<span class="placed-label">${icon('check')} Placed</span>`}</button>`,
      )
      .join('');
    element('score').textContent = state.score.toLocaleString();
    element('best').textContent = state.best.toLocaleString();
    element<HTMLButtonElement>('undo').disabled = !canUndo || busy;
    element<HTMLButtonElement>('rotate').disabled = selected < 0 || busy;
    element<HTMLButtonElement>('hint').disabled = busy;
    element<HTMLButtonElement>('restart').disabled = busy;
    element<HTMLButtonElement>('restart-overlay').disabled = busy;
    element('move-hint').textContent = state.tutorial
      ? 'Try the blue block in the two glowing spaces.'
      : 'Pick a block. Find its spot. Make a little space.';
    element('sound').innerHTML = icon(state.sound ? 'sound' : 'mute');
    element('sound').setAttribute('aria-pressed', String(state.sound));
    element('sound').setAttribute('aria-label', state.sound ? 'Turn sound off' : 'Turn sound on');
    const over = !hasMoves(state.board, state.tray);
    element('game-over').classList.toggle('hidden', !over);
    element('board').inert = over;
    element('final-score').textContent = `${state.score.toLocaleString()} points`;
    element('bricks').textContent = String(state.bricks);
    const count = state.built.length + 1,
      total = PROJECTS.length + 1;
    element('building-count').textContent = `${count} / ${total} places`;
    element('town-level').textContent = [
      'A fresh beginning',
      'Something sweet is growing',
      'A greener little world',
      'A curious little community',
      'Room for good company',
      'A town full of possibility',
      'Your own little happy place',
    ][state.built.length]!;
    element('town-progress').innerHTML = Array.from(
      { length: total },
      (_, i) => `<span class="${i < count ? 'filled' : ''}"></span>`,
    ).join('');
    element('town-progress').setAttribute('aria-label', `${count} of ${total} places built`);
    const signature = state.built.join(',') + '!';
    if (signature !== this.builtSignature) {
      this.builtSignature = signature;
      element('town-scene').innerHTML = townSVG(state.built, newBuilding);
      element('town-scene').setAttribute(
        'aria-label',
        `Your town has ${count} places: a starter home${state.built.map((id) => ', ' + PROJECTS.find((p) => p.id === id)!.name).join('')}.`,
      );
    }
    const project = PROJECTS[state.built.length],
      button = element<HTMLButtonElement>('build');
    element('build-icon').innerHTML = buildingIcon(project?.id ?? 'park');
    element('build-label').textContent = project
      ? 'YOUR NEXT LITTLE DREAM'
      : 'LOOK WHAT YOU CREATED';
    element('build-name').textContent = project?.name ?? 'Your town is complete';
    element('build-description').textContent =
      project?.description ??
      'Seven lovely places. All built by you. Keep playing for a new best score.';
    element('cost-detail').innerHTML = project
      ? `${icon('brick')}<span><strong>${project.cost}</strong> bricks to build</span>`
      : `${icon('check')}<span>Every little dream, built.</span>`;
    button.innerHTML = project
      ? 'Build ' + project.name.split(' ').at(-1) + ' ' + icon('arrow')
      : 'Town complete ' + icon('check');
    button.disabled = !project || state.bricks < project.cost || busy;
    button
      .closest('.build-card')
      ?.classList.toggle('ready', !project || state.bricks >= project.cost);
    element('build-progress').style.width =
      `${project ? Math.min(100, (state.bricks / project.cost) * 100) : 100}%`;
  }
}
