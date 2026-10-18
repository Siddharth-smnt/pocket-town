# Android setup and installation

## Requirements

Use Node 24 LTS, Android Studio Otter 2025.2.1 or newer, Java 21, SDK Platform 36 and Build Tools 36.0.0. The Android project and Gradle wrapper are committed; do not run `cap add android` again.

Install SDK packages under **Tools → SDK Manager**. Select Java 21 under **Settings → Build, Execution, Deployment → Build Tools → Gradle**. The terminal must also use Java 21; verify `java -version`. If Android Studio bundles a newer JDK, select a separate Java 21 installation for predictable builds.

Set `ANDROID_HOME` to the SDK folder, or create ignored `android/local.properties` using the actual path shown in SDK Manager:

```properties
# Windows example: replace YourName. Forward slashes avoid escaping issues.
sdk.dir=C:/Users/YourName/AppData/Local/Android/Sdk
```

```properties
# macOS example
sdk.dir=/Users/YourName/Library/Android/sdk
```

Linux paths vary. Keep this file out of Git. Point `JAVA_HOME` to Java 21 and include its `bin` on PATH; reopen the terminal after environment changes.

## Build

From the repository root:

```sh
npm ci
npm run android:debug
```

This builds web assets, syncs the default offline configuration and runs Gradle `assembleDebug`. Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

No Play account, AdMob account, production signing key or backend is needed. Default APKs exclude AdMob. The native shell retains Internet permission for optional integrations; core gameplay makes no remote requests.

For Android Studio:

```sh
npm run android:sync
npm run android:open
```

Select a phone/emulator and press Run. Re-sync after changing web code.

## Install on a phone

1. Download a successful Actions artifact beginning `pocket-town-debug-`, or copy your local APK to the phone.
2. Extract the artifact ZIP if needed, then open `app-debug.apk`.
3. Allow installation from the browser/file app when Android asks, install, and open Pocket Town. You can disable that install permission afterward.

With USB debugging/platform tools:

```sh
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Artifacts include the source commit and SHA-256 checksum. Local and CI builds can use different debug signing keys. Signature conflicts may require uninstalling first, which can erase town progress. Permanent distribution needs a stable release signing setup.

## Test ads

```sh
npm run android:test-ads
```

This enables UI/native flags together and builds a debug APK with Google's demo ads. Internet is needed for ads. Both variants share the provisional app ID, so one replaces the other if signatures match. Run `npm run android:sync` afterward to restore the default checkout configuration.

## Identity

The provisional ID is `com.siddharthsmnt.pockettown.dev`. Before first Play upload, choose a unique permanent package. Change `appId` in `capacitor.config.ts`, `namespace`/`applicationId` in `android/app/build.gradle`, the Java package/path for `MainActivity`, and package/custom URL strings in `strings.xml`. Then sync/build. A changed app ID creates a different app and separate saves.

Version is 0.2.0, code 2. Increase `versionCode` on each Play upload; keep version names consistent.

## Common errors

| Error                          | Fix                                                                  |
| ------------------------------ | -------------------------------------------------------------------- |
| `invalid source release: 21`   | Use Java 21 in terminal and Gradle settings                          |
| SDK location missing           | Set `ANDROID_HOME` or `local.properties`                             |
| Missing platform/tools         | Install Platform 36 and Build Tools 36.0.0                           |
| License not accepted           | Review/accept SDK licenses in SDK Manager or `sdkmanager --licenses` |
| Missing plugin or stale screen | Run the appropriate build wrapper to rebuild/sync                    |
| Gradle download failure        | Check allowed access to Gradle, Google Maven and Maven Central       |

References: [Capacitor environment](https://capacitorjs.com/docs/getting-started/environment-setup), [Capacitor 8 toolchain](https://capacitorjs.com/docs/updating/8-0), [SystemBars](https://capacitorjs.com/docs/apis/system-bars), [Android command-line builds](https://developer.android.com/build/building-cmdline).
