# Release checklist

This project builds a debug game. It does not create accounts, pay fees, generate production keys, upload or publish. An APK build is not production approval.

## Product and devices

- Complete the device acceptance matrix in `TESTING.md`, including offline startup, process death, font scaling and low storage.
- Test actual Android hardware, display cutouts, gesture navigation and older supported WebViews.
- Validate progression with players; decide whether six upgrades are sufficient for the first release.
- Choose the real audience, languages, support contact and store identity.

## Signing and build

- Complete appropriate Play registration and required identity/device verification.
- Replace the provisional package ID before first upload; an existing Play listing's package cannot change.
- Set version name/code and run `npm run android:sync` for the default configuration.
- In Android Studio choose **Build → Generate Signed App Bundle or APK → Android App Bundle**. Create/select the upload key locally and follow Play App Signing guidance.
- Keep keys/passwords outside Git and chat, with a secure recovery copy. No production key is generated here.
- `npm run android:bundle` produces unsigned `android/app/build/outputs/bundle/release/app-release.aab`; sign it before upload. Android Studio's signed-bundle flow is the beginner path.
- Recheck current target API rules immediately before submission. This project targets API 36 following Capacitor 8's template; that is not perpetual eligibility.
- Test the exact signed release build; debug success does not verify it.

## Listing and disclosures

- Prepare accurate name, descriptions, category, high-resolution icon, feature graphic, screenshots and support email.
- Host a public privacy policy describing the actual build and data behavior.
- Complete Data Safety, rating, ads, audience/content and app-access questions from actual code/SDKs. Default and test-ad builds differ; do not submit generic answers for both.
- If children are included, apply current Families requirements before production ads.
- There are no accounts or remote data-deletion endpoints in v0.1.0. Revisit disclosures when online features are added.

## Test tracks and launch

- Upload a signed AAB to internal testing and address automated/pre-launch findings.
- Follow the account's current testing/production-access requirements. New personal accounts may need qualifying closed testing; internal testing alone may not satisfy them.
- Check countries, availability, pricing, supported devices and policy status.
- Obtain explicit owner approval before publishing. This task leaves a pull request without merging or publishing.

## Official sources

Recheck before submitting; requirements change. Core API/Families guidance was reviewed on 2026-10-17.

- [Target API](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Personal-account testing](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Registration](https://support.google.com/googleplay/android-developer/answer/6112435)
- [App signing](https://developer.android.com/studio/publish/app-signing)
- [App bundles](https://developer.android.com/guide/app-bundle)
- [Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Families](https://support.google.com/googleplay/android-developer/answer/9893335)
