# Testing and verification

## Automated checks

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run format:check
```

Unit tests cover placement, overlap, rotation, crossing clears, scoring, rotated game-over detection, hints, purchases, restart/undo, rewards, malformed saves, migration, backup recovery, ordered writes and newer-save protection.

On a local development machine with browser tooling:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright uses desktop, Pixel 7 and 320-pixel phone viewports. It checks the opening/build/reload/restart loop, undo, hints, help, recovery, game over and desktop dragging, plus overflow and runtime errors. It captures screenshots and keeps failure traces. Phone emulation is not Android WebView testing.

## CI

CI checks out the exact PR head. Checks precede browser and Android jobs. It compiles default and test-ad APKs, verifies debug signatures and uploads the source commit/checksum beside each APK. Browser artifacts last 14 days; APKs last 30 days. Open Actions → successful run → Artifacts; downloads may require GitHub sign-in. CI never uploads to Play or uses release keys.

## Verification record

Initial implementation checkpoint, 2026-10-17:

| Check                                | Status                                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Unit tests                           | 33 passed locally                                                                                     |
| Strict TypeScript and Vite build     | Passed locally                                                                                        |
| Native project generation/sync       | Passed; default App/Preferences plugins only                                                          |
| Local Android compilation            | Blocked at Gradle download by network restrictions; local Java is 17 and no Android SDK is configured |
| CI browser/Android jobs              | Pending first PR run                                                                                  |
| Visual screenshot inspection         | Pending CI screenshots                                                                                |
| Emulator/physical phone              | Not run                                                                                               |
| Real native test-ad display/callback | Not run on a device                                                                                   |
| Signed release/Play submission       | Not performed                                                                                         |

The final PR records completed runs and commit. Pending checks are not successful checks.

## Manual device acceptance

- Cold-launch default APK in airplane mode; finish the tutorial and build the bakery.
- Tap/rotate/drag near each edge; background during a drag and return.
- Clear multiple lines, undo once, buy a building and ensure undo cannot refund it.
- Restart, background/resume, force-stop/reopen and reboot; verify saved progress.
- Test Android Back, dialogs, orientation, text scaling, TalkBack and reduced motion.
- Check cutouts/system bars/touch targets on compact phones and tablets.
- Test storage failure warnings; uninstall/clear-data behavior must match the docs.
- On the test-ad build, test offline failure, early dismissal, completion, rapid taps and background/resume during ads. Reward exactly once and allow continued play.

Device failures block a production release even with passing CI.
