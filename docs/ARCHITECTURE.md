# Architecture

Vite bundles strict TypeScript and the prototype's HTML/CSS/SVG presentation. Capacitor packages the built assets in Android's WebView. Gameplay has no server dependency.

## Boundaries

| Module                    | Responsibility                                                       |
| ------------------------- | -------------------------------------------------------------------- |
| `game/config.ts`          | Piece pool, board, building costs and rewards                        |
| `game/rules.ts`           | Pure placement, rotation, clear detection and hint search            |
| `game/session.ts`         | Atomic actions, spending and one-move undo; exposes cloned snapshots |
| `persistence/schema.ts`   | Treat JSON as unknown, validate fields and migrate v1                |
| `persistence/store.ts`    | Serialize writes and recover from a previous snapshot                |
| `platform/preferences.ts` | Native Preferences and its browser localStorage fallback             |
| `platform/rewards.ts`     | One active presentation and one eligible callback                    |
| `platform/admob.ts`       | Lazy Android-only test-ad adapter                                    |
| `ui/game.ts`              | Event binding and lifecycle; save before animation                   |
| `ui/renderer.ts`          | Render snapshots without mutating them                               |
| `ui/drag.ts`              | Pointer capture, ghost position and cancellation                     |

UI/platform code depends on domain modules, never the reverse. Rules have no DOM, storage or Capacitor imports. This keeps them independently testable.

## Saves

Schema v2 stores board, remaining tray, score, best score, bricks, ordered building IDs, sound and tutorial flags. Keys are `pocket-town-v2` and `pocket-town-v2-backup`; the browser Preferences implementation prefixes them with `CapacitorStorage.`.

Loading validates the primary, then tries a valid backup if damaged. With no current save, it tries `pocket-town-v1`; the web adapter also reads the prototype's old unprefixed key on the same origin. Unsupported shapes, duplicate coordinates, invalid counters and out-of-order buildings are rejected. Unknown properties are discarded.

If no data is recoverable, the game starts a new tutorial and explains the reset. If storage cannot be read, or a newer schema exists, the session is temporary and will not overwrite that save.

Each mutation queues a serialized snapshot. Before a new primary write, the last successful snapshot becomes the backup. Writes are ordered, not debounced. Failures display a warning without poisoning subsequent writes. A backup is one previous snapshot, not cloud storage or a transaction log: recovery can lose the latest move/purchase. Process death before a queued write completes can also lose recent progress.

Undo is memory-only. It restores the previous move's board, score, tray and currency while retaining best score and the current sound setting. Purchases, rewards, restarts and reloads invalidate it, preventing currency refunds after receiving a building.

## Android

Provisional package: `com.siddharthsmnt.pockettown.dev`. Minimum API 24; compile/target API 36; Java 21. Native backup is disabled. Do not promise uninstall recovery.

The build wrapper sets UI and native flags together. Default builds include App and Preferences only. Test-ad mode adds AdMob. `cap sync` regenerates plugin registrations/dependencies, so always sync when switching mode.

Moves commit before animations; backgrounding cancels drags, suspends audio and flushes pending writes. Android Back closes a dialog or offers to exit. SystemBars and CSS safe-area values handle native insets.

Local saves are editable data, with no server authority or cash value. There is no authentication, analytics, remote crash reporting, multiplayer or billing service. Test ads can contact Google only in the explicit test-ad build.

## Toolchain dependency note

The Capacitor CLI pulls an iOS-only `xcode` helper with an old UUID dependency. A scoped npm override pins its UUID implementation to 11.1.1 to address GHSA-w5hq-g745-h8pq. The helper uses the compatible CommonJS `v4()` API; this override is not bundled into the Android game. Recheck it when upgrading Capacitor.
