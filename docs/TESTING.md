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

Playwright uses desktop, Pixel 7 and 320-pixel phone viewports. It checks the visible version, Home/puzzle/build/reload/restart loop, navigation without state loss, browser Back/Forward, pause/help/sound, restart cancellation, undo, hints, recovery, game over and desktop dragging. Compact portrait (320×568) and landscape (740×360) checks ensure puzzle tools remain on screen. It also checks horizontal overflow and runtime errors. It captures screenshots and keeps failure traces. Phone emulation is not Android WebView testing.

## CI

CI checks out the exact PR head. Checks precede browser and Android jobs. It compiles default, separate Preview and test-ad APKs, verifies debug signatures, compares every packaged web asset with `dist/`, and checks native/web versions and package IDs agree. Versioned APK filenames, source commit, SHA-256 checksum and package metadata are uploaded together.

The `android-smoke` job downloads those exact default and Preview APKs, verifies their checksums, and installs both on an API 35 Pixel 2 emulator. For each app, using Android's UI hierarchy, it checks Home and its version label, enters the puzzle, opens/closes pause with Android Back, returns Home, and cold-relaunches. It rejects a native action/title bar and captures screenshots and logs in `android-smoke-results`, separated into `default/` and `preview/`. This is a focused native packaging/navigation check; it does not replace the device acceptance list below or test real ad callbacks.

Browser/emulator artifacts last 14 days; APKs last 30 days. Open Actions → successful run → Artifacts; downloads may require GitHub sign-in. CI never uploads to Play or uses release keys.

## Verification record

Implementation verification, 2026-10-17 (the PR links the exact final CI run and tested source commit):

| Check                                | Status                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Unit tests                           | 37 passed locally, including a simulated native ad adapter                                                 |
| Strict TypeScript and Vite build     | Passed locally                                                                                             |
| Native project generation/sync       | Passed; default App/Preferences plugins only                                                               |
| Local Android compilation            | Blocked at Gradle download by network restrictions; local Java is 17 and no Android SDK is configured      |
| CI browser/Android jobs              | Both Android variants compiled and passed signature verification in CI; see PR for final browser/build run |
| Visual screenshot inspection         | Desktop and 320px phone CI screenshots inspected; no layout clipping observed                              |
| Emulator/physical phone              | Not run                                                                                                    |
| Real native test-ad display/callback | Not run on a device                                                                                        |
| Signed release/Play submission       | Not performed                                                                                              |

The PR records the exact tested commit, CI run and screenshots for the Home/puzzle redesign and subsequent Android launch fix (2026-10-18). The table above is the original baseline, not a claim that later changes passed. The emulator job was added after a physical-phone report exposed a native title bar that browser screenshots could not show. Pending checks are not successful checks.

## Manual device acceptance

- Cold-launch to Home in airplane mode. Open Play, finish the tutorial, return Home and build the bakery.
- Continue the same puzzle; check the pause menu, restart cancellation, and Home → Play → Android Back → Home. Verify a second Back offers to exit.
- Tap/rotate/drag near each edge; background during a drag and return.
- Clear multiple lines, undo once, buy a building and ensure undo cannot refund it.
- Restart, background/resume, force-stop/reopen and reboot; verify saved progress.
- Test Android Back, dialogs, orientation, text scaling, TalkBack and reduced motion.
- Check cutouts/system bars/touch targets on compact phones and tablets.
- Test storage failure warnings; uninstall/clear-data behavior must match the docs.
- On the test-ad build, test offline failure, early dismissal, completion, rapid taps and background/resume during ads. Reward exactly once and allow continued play.

Device failures block a production release even with passing CI.
