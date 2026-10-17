import { SIZE } from '../game/config';
import type { Piece } from '../game/types';
import { element } from './dom';
interface DragCallbacks {
  piece: (index: number) => Piece | null | undefined;
  select: (index: number) => void;
  preview: (r: number, c: number) => void;
  place: (r: number, c: number) => void;
  clear: () => void;
  blocked: () => boolean;
}
export function installDrag(callbacks: DragCallbacks): () => void {
  let drag: {
    pointer: number;
    index: number;
    x: number;
    y: number;
    touch: boolean;
    moved: boolean;
    target: HTMLElement;
    pos: [number, number] | null;
  } | null = null;
  let ghost: HTMLElement | null = null;
  function cancel(): void {
    drag?.target.classList.remove('dragging');
    drag = null;
    ghost?.remove();
    ghost = null;
    callbacks.clear();
  }
  element('tray').addEventListener('pointerdown', (event) => {
    const target = (event.target as Element).closest<HTMLButtonElement>('[data-index]');
    if (!target || target.disabled || callbacks.blocked() || event.button !== 0) return;
    event.preventDefault();
    const index = Number(target.dataset.index);
    if (!callbacks.piece(index)) return;
    // Selection redraws the tray, so capture on its stable container, not a replaced button.
    callbacks.select(index);
    drag = {
      pointer: event.pointerId,
      index,
      x: event.clientX,
      y: event.clientY,
      touch: event.pointerType === 'touch',
      moved: false,
      target: element('tray'),
      pos: null,
    };
    element('tray').setPointerCapture(event.pointerId);
  });
  window.addEventListener(
    'pointermove',
    (event) => {
      if (!drag || event.pointerId !== drag.pointer) return;
      if (callbacks.blocked()) {
        cancel();
        return;
      }
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 7) return;
      event.preventDefault();
      const piece = callbacks.piece(drag.index);
      if (!piece) {
        cancel();
        return;
      }
      const rect = element('board').getBoundingClientRect(),
        style = getComputedStyle(element('board'));
      const border = parseFloat(style.borderLeftWidth),
        gap = parseFloat(style.columnGap),
        cell = (rect.width - 2 * border - 7 * gap) / 8,
        step = cell + gap;
      const w = Math.max(...piece.shape.map(([, c]) => c)) + 1,
        h = Math.max(...piece.shape.map(([r]) => r)) + 1;
      if (!drag.moved) {
        drag.moved = true;
        ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.innerHTML = piece.shape
          .map(
            ([r, c]) =>
              `<i class="tile ${piece.color}" style="grid-row:${r + 1};grid-column:${c + 1}"></i>`,
          )
          .join('');
        document.body.append(ghost);
      }
      const width = w * step - gap,
        height = h * step - gap,
        x = event.clientX - width / 2,
        y = event.clientY - height / 2 - (drag.touch ? 65 : 16);
      ghost!.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${height}px;grid-template-columns:repeat(${w},1fr);grid-template-rows:repeat(${h},1fr);gap:${gap}px`;
      const row = Math.round((y - rect.top - border) / step),
        col = Math.round((x - rect.left - border) / step);
      drag.pos = [row, col];
      callbacks.preview(row, col);
    },
    { passive: false },
  );
  window.addEventListener('pointerup', (event) => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const current = drag;
    cancel();
    if (current.moved && current.pos) {
      const [r, c] = current.pos;
      if (r >= 0 && c >= 0 && r < SIZE && c < SIZE && !callbacks.blocked()) callbacks.place(r, c);
    }
  });
  window.addEventListener('pointercancel', cancel);
  element('tray').addEventListener('lostpointercapture', () => {
    if (drag) cancel();
  });
  return cancel;
}
