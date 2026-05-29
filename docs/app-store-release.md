# NearNow App Store Release Checklist

This project now ships as a Capacitor app wrapper so it can be released to both mobile stores.

## 1) One-time prerequisites

- Apple Developer Program account
- Google Play Console account
- macOS + Xcode for iOS release builds
- Android Studio for Android release builds

## 2) Prepare native projects

```bash
npm run mobile:init
```

After the first run, use:

```bash
npm run mobile:sync
```

## 3) Open and configure iOS

```bash
npm run mobile:ios
```

In Xcode:

- Set the Team and signing profile.
- Confirm `Bundle Identifier` is unique and matches your app identity.
- Update version/build numbers for the release.
- Add required privacy usage descriptions in `ios/App/App/Info.plist` before submission.
- Archive and upload to App Store Connect.

## 4) Open and configure Android

```bash
npm run mobile:android
```

In Android Studio:

- Set `applicationId` and version values in `android/app/build.gradle`.
- Create/sign a release keystore.
- Build an Android App Bundle (`.aab`) release build.
- Upload the `.aab` to the Play Console.

## 5) Store listing assets and compliance

Before final submission in both stores:

- Privacy policy URL and support URL
- App icon and screenshots for supported device sizes
- Age/content rating questionnaire
- Data safety (Google Play) and privacy nutrition labels (Apple)
- Category, description, and keywords

## 6) Final submission

- Submit iOS build for App Review in App Store Connect.
- Submit Android release to production (or staged rollout) in Play Console.

Publishing itself requires your store accounts and signing credentials, which cannot be completed from this repository alone.
