# MySalah Web/PWA Deployment

## Goal

Deploy MySalah as a web app on Vercel so it can be opened in Safari and added
to the iPhone home screen.

## GitHub to Vercel

1. Push this project to GitHub.
2. Open Vercel and choose Add New > Project.
3. Import the MySalah GitHub repository.
4. Keep the framework preset as Other if Vercel does not detect Expo.
5. Confirm these settings:
   - Build command: `npx expo export -p web`
   - Output directory: `dist`
   - Install command: `npm install`
6. Deploy.

The repository includes `vercel.json`, so Vercel should apply the build command,
output directory, and single-page app rewrite automatically.

## iPhone Test

1. Open the Vercel URL in Safari on iPhone.
2. Confirm the Today screen loads.
3. Open Settings and tap GPS.
4. Allow location permission.
5. Confirm prayer times update for the current location.
6. Tap Share.
7. Tap Add to Home Screen.
8. Name it MySalah and tap Add.
9. Launch MySalah from the home screen icon.

## Current Web Limits

- Native local notifications do not run on the web version.
- Qibla compass currently uses the native Expo heading API, so the web version
  shows the fallback message.
- Offline support needs a service worker/PWA caching pass later.
