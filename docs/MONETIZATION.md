# Optional rewarded ads

The adapter uses `@capacitor-community/admob` 8.2.1 with Capacitor 8.5.3. The default configuration excludes AdMob from native plugin registration and Gradle dependencies.

`npm run android:test-ads` enables `VITE_ENABLE_TEST_ADS` and `POCKET_TOWN_TEST_ADS` together. Default and bundle build wrappers force them off. Browser previews never activate the native ad adapter.

Only Google's Android demo IDs are included:

- App: `ca-app-pub-3940256099942544~3347511713`
- Rewarded unit: `ca-app-pub-3940256099942544/5224354917`

The adapter loads after the user chooses the optional button. It requests test/non-personalized ads, general-audience content and conservative child/under-consent-age flags for development. These settings are not a production age-screening or consent solution.

Only the native `Rewarded` event grants bricks. The show promise alone cannot grant them. The service rejects concurrent presentations and duplicate/late callbacks. Early dismissal or load/show failure earns nothing; earned rewards invalidate undo and save immediately. A two-minute adapter timeout blocks further native ad attempts until restart to avoid overlapping timed-out presentations.

Test ads generate no revenue and can contact Google services. No banner, interstitial, ad-on-start or production ad unit exists. The game remains usable without ads or a connection.

## Production work still needed

- Decide the actual audience. An all-age game can include children; do not declare adults-only merely to avoid requirements.
- Review current Families rules, certified SDK requirements, mixed-audience age screening and the exact packaged SDK version.
- Implement and test the applicable consent/choice flow and privacy-options access. This adapter does not implement a production UMP flow; non-personalized ads alone do not settle consent requirements.
- Audit permissions/data collection and write accurate privacy and Data Safety disclosures for the selected build.
- Consider server-side verification and durable transaction IDs before giving rewards real value. Current bricks are local progress with no cash value.
- Implement Play Billing, acknowledgement/restoration and entitlements separately if cosmetics are added; none are present now.

References: [plugin](https://github.com/capacitor-community/admob), [Google test ads](https://developers.google.com/admob/android/test-ads), [rewarded ads](https://developers.google.com/admob/android/rewarded), [UMP privacy](https://developers.google.com/admob/android/privacy), [Families](https://support.google.com/googleplay/android-developer/answer/9893335).
