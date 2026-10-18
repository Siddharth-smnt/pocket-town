# Pocket Town development

- Use Node 24, the committed npm lockfile, Java 21 and the Gradle wrapper.
- Keep domain rules in `src/game` free of DOM, Capacitor and storage dependencies.
- `GameSession` owns mutations and one-step undo. Purchases, ad rewards and restarts invalidate undo.
- Persist snapshots through `SaveStore`; serialize writes and validate/migrate before reading. Never overwrite a future save version.
- Default Android builds must exclude AdMob. Only `npm run android:test-ads` enables the native test plugin and test IDs together.
- Preserve the original town SVG artwork and the responsive, accessible controls.
- Run `npm test`, `npm run build` and `npm run format:check` before committing. Run browser and Android checks when tools permit and report their actual results.
- Add tests for new state transitions and recovery behavior, not for incidental implementation details.
- Update relevant docs for changed commands, rules, dependencies, data handling or limitations.
- Keep generated web assets, local SDK paths, signing keys, secrets and build outputs out of Git.
- Work on a feature branch; do not merge or publish to Google Play without explicit user authorization.
