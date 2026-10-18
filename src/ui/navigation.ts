import { element } from './dom';

export type Screen = 'home' | 'game';

/** Screen history is UI state; changing it never starts or resets a puzzle. */
export class ScreenNavigation {
  current: Screen = 'home';
  private returningHome = false;

  constructor(private readonly changed: (screen: Screen) => void) {
    // Every cold launch/reload opens Home, with the saved board available via Continue.
    history.replaceState({ pocketScreen: 'home' }, '', '#home');
    window.addEventListener('popstate', (event: PopStateEvent) => {
      this.returningHome = false;
      this.show(event.state?.pocketScreen === 'game' ? 'game' : 'home');
    });
  }

  play(): void {
    if (this.current === 'game' || this.returningHome) return;
    history.pushState({ pocketScreen: 'game' }, '', '#play');
    this.show('game');
  }

  home(): void {
    if (this.current === 'home' || this.returningHome) return;
    this.returningHome = true;
    history.back();
  }

  private show(screen: Screen): void {
    this.current = screen;
    for (const name of ['home', 'game'] as const) {
      const section = element(`${name}-screen`);
      section.hidden = name !== screen;
      section.inert = name !== screen;
    }
    document.body.dataset.screen = screen;
    document.title = screen === 'home' ? 'Pocket Town — Your little world' : 'Pocket Town — Puzzle';
    this.changed(screen);
    window.scrollTo({ top: 0, behavior: 'instant' });
    element(screen === 'home' ? 'home-title' : 'puzzle-title').focus({ preventScroll: true });
  }
}
