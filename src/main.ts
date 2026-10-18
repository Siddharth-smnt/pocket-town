import './ui/styles.css';
import { SaveStore, type SaveStatus } from './persistence/store';
import { preferencesStorage } from './platform/preferences';
import { createRewardService } from './platform/admob';
import { buildLabel } from './platform/build';
import { element } from './ui/dom';
import { mountGame } from './ui/game';

const statusText: Record<SaveStatus, string> = {
  saved: 'Your progress stays on this device',
  saving: 'Saving your little world…',
  failed: 'Could not save. Progress may be lost when you close.',
  readonly: 'Temporary game — your newer save is protected',
};
async function start(): Promise<void> {
  void buildLabel().then((label) => {
    document.querySelectorAll('[data-build-version]').forEach((node) => {
      node.textContent = label;
    });
  });
  const saves = new SaveStore(preferencesStorage, (status) => {
    element('save-status').textContent = statusText[status];
    element('save-footer').classList.toggle(
      'save-warning',
      status === 'failed' || status === 'readonly',
    );
  });
  const loaded = await saves.load();
  if (loaded.reason !== 'future' && loaded.reason !== 'unavailable') await saves.save(loaded.state);
  await mountGame(loaded.state, saves, createRewardService());
  const messages: Partial<Record<typeof loaded.reason, string>> = {
    migrated: 'Your previous puzzle and town have been brought forward.',
    recovered: 'Your last backup was recovered. The most recent move may be missing.',
    reset: 'The saved game could not be read. A fresh town has been started.',
    unavailable:
      'Device storage is unavailable. This game is temporary; your existing save has not been changed.',
    future:
      'This save belongs to a newer app version. Update the app to continue it. This temporary game will not replace it.',
  };
  const message = messages[loaded.reason];
  if (message) {
    element('recovery-notice').textContent = message;
    element('recovery-notice').classList.remove('hidden');
  }
  document.body.dataset.ready = 'true';
}
void start().catch((error) => {
  console.error('Pocket Town could not start', error);
  element('startup-error').classList.remove('hidden');
});
element('retry-start').addEventListener('click', () => location.reload());
