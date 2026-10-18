# Pocket Town

An offline Android block puzzle. Clear an 8×8 board, collect bricks, and grow a town from one home to seven places. Built with strict TypeScript, Vite and Capacitor, reusing the original prototype's rules and SVG artwork.

**Start here:** use `npm run dev` for a browser preview, or install the default debug APK from a successful [Actions run](https://github.com/Siddharth-smnt/pocket-town/actions). Neither needs a Play Console account.

Already have an older debug build? Use the **Pocket Town Preview** APK to try this UI alongside the old app. It uses separate local progress and leaves the existing installation intact. See [installation](docs/ANDROID.md).

## Features

- Dedicated Home for your town and buildings, with Play/Continue leading to a focused puzzle screen.
- Pause menu for help, sound and restart; Home and Android Back retain your current board.
- Tap, drag and keyboard placement; rotation, previews and free hints.
- Simultaneous row/column clears, scoring, best score and configurable rewards.
- Six town upgrades, single-move undo and restarts that retain town progress.
- Versioned local saves, backup recovery and prototype migration on the same browser origin.
- Sound, reduced motion, responsive layout, native safe areas and background/resume handling.
- A default Android build without AdMob, plus a separate optional test-ad build.
- Tests, CI, Gradle wrapper, native Android source and setup/release documentation.

This first version has no accounts, cloud saves, shared towns, real purchases or production ads. After completing the town, the puzzle and best-score challenge remain playable. See [testing](docs/TESTING.md) and the [roadmap](docs/ROADMAP.md).

## First setup

Install [Git](https://git-scm.com/downloads) and [Node.js 24 LTS](https://nodejs.org/). Open a terminal; PowerShell works on Windows. Until the PR is merged, select the feature branch:

```sh
git clone https://github.com/Siddharth-smnt/pocket-town.git
cd pocket-town
git switch feat/android-game
npm ci
npm run dev
```

Open the local URL printed by Vite. Keep the terminal open while playing; Ctrl+C stops it. Do not open `index.html` directly. The web preview needs that server; the Android APK bundles its files and plays offline. Browser saves do not automatically transfer to Android.

## Commands

| Command                    | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `npm run dev`              | Browser development server                              |
| `npm test`                 | Rules, progression, saves and reward tests              |
| `npm run typecheck`        | Strict TypeScript checks                                |
| `npm run build`            | Check types and create `dist/`                          |
| `npm run format`           | Format source and docs                                  |
| `npm run format:check`     | Check formatting                                        |
| `npm run test:e2e`         | Browser interactions; install Playwright Chromium first |
| `npm run android:sync`     | Build and sync default offline Android configuration    |
| `npm run android:open`     | Open Android Studio                                     |
| `npm run android:debug`    | Build default debug APK                                 |
| `npm run android:preview`  | Build separate Preview app alongside an older install   |
| `npm run android:test-ads` | Build debug APK with Google's test rewarded ads         |
| `npm run android:bundle`   | Build unsigned release AAB; signing is separate         |

Android needs Java 21, SDK Platform 36 and Build Tools 36.0.0. See [Android setup and installation](docs/ANDROID.md) for Windows-friendly instructions.

## Code map

| Path                       | Responsibility                                          |
| -------------------------- | ------------------------------------------------------- |
| `src/game/`                | Types, configuration, pure rules and atomic actions     |
| `src/persistence/`         | Validation, migrations, backup and ordered writes       |
| `src/platform/`            | Preferences, audio, lifecycle and optional ads          |
| `src/ui/`                  | Rendering, controls, drag, styles and original SVG town |
| `src/main.ts`              | Load data and start the game                            |
| `android/`                 | Native shell, manifest, icons and Gradle wrapper        |
| `tests/`, `e2e/`           | Unit and browser checks                                 |
| `.github/workflows/ci.yml` | Checks, browser reports and debug APK artifacts         |

## Documentation

- [Screens and navigation](docs/UI.md)
- [Architecture and saving](docs/ARCHITECTURE.md)
- [Gameplay and economy](docs/GAMEPLAY.md)
- [Android setup](docs/ANDROID.md)
- [Testing and limitations](docs/TESTING.md)
- [Rewarded ads](docs/MONETIZATION.md)
- [Release checklist](docs/RELEASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Credits](docs/CREDITS.md)

## Troubleshooting

- `npm` not recognized: install Node 24 and reopen the terminal.
- Missing dependencies: run `npm ci` in the folder containing `package.json`.
- Java/SDK errors: follow `docs/ANDROID.md` and verify `java -version` reports 21.
- Old Android UI: the current Home shows `Version 0.2.1 · build 3` and “Make yourself at home.” Download the versioned APK from the latest successful run; confirm Android actually completes the installation. For local builds, run `npm run android:sync` before building in Android Studio.
- No ads button: expected in the default build and browser. Use the explicit native test-ad build.
- Save warning: progress may be lost if storage writes fail. Failed reads start a temporary game without overwriting existing data.
- APK signature conflict: different CI runs and local builds can use different debug keys. A failed update leaves the previous app installed. Keep it installed if its progress matters; uninstalling or clearing data can erase progress. See [Android installation](docs/ANDROID.md).

Progress stays on the device. Uninstalling or clearing app/browser data can remove it. This version has no remote backup service.
