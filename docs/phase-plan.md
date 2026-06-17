# MySalah Phase Plan

## Phase 1: Foundation

Goal: make the app open to a calm, testable shell before adding permissions.

- Expo React Native TypeScript project
- Expo SDK 54 target for current Expo Go compatibility
- Basic app theme
- Today, Qibla, and Settings screens
- Bottom tab navigation
- Mock prayer data
- Web preview/export verification

## Phase 2: Prayer Times

Goal: replace mock data with calculated daily prayer times.

- Install Adhan.js
- Add location permission request
- Store last known coordinates locally
- Calculate today from saved/current coordinates
- Highlight current or next prayer
- Add live countdown
- Add high-latitude handling for Denmark

## Phase 3: Local Storage

Goal: persist settings and offline-ready state.

- Completed: store location, calculation method, Asr method, offsets, and notification preference
- Completed: load saved state on startup
- Completed: use saved coordinates when offline or permission is unavailable
- Completed: add clear fallback states for missing location
- Completed: add local Settings controls for calculation method, Asr method, offsets, and notification preference

## Phase 4: Notifications

Goal: schedule simple local reminders.

- Completed: request notification permission
- Completed: schedule reminders before prayers using the saved reminder preference
- Completed: skip expired reminders for the current day
- Completed: reschedule on date, location, setting, or notification preference changes
- Completed: add a Settings test button that schedules a notification in 10 seconds
- Verify on a real iPhone

## Phase 5: Settings

Goal: make calculation and reminder behavior adjustable without clutter.

- Completed: calculation method picker
- Completed: Asr method picker
- Completed: manual offsets per prayer
- Completed: notification enable/disable preference
- Completed: location refresh action
- Completed: accuracy note

## Phase 6: Qibla

Goal: add real-time Qibla direction.

- Completed: calculate Qibla angle from stored/current coordinates
- Completed: read device heading on iOS/Android
- Completed: rotate Qibla arrow in real time
- Completed: add simple sensor guidance
- Completed: handle unavailable or unreliable heading

## Phase 7: Personal Testing

Goal: make the app reliable enough for daily use.

- Compare against local mosque timetable for 7-14 days
- Tune calculation method and offsets
- Test offline launch behavior
- Test notifications after app restarts
- Test Qibla outdoors and indoors

## Phase 8: Web/PWA Deployment

Goal: deploy MySalah as a web app that can be added to the iPhone home screen.

- Completed: add web app icon and manifest files
- Completed: add Vercel config
- Deploy to Vercel from GitHub
- Test on iPhone Safari
- Add to Home Screen
- Test GPS on HTTPS
- Decide later whether to add web notifications

## Other ideas later

- Widgets for countdown and next prayer
- Bottom navbar, make it smaller or somehow more sleek, it fills a lot I feel, maybe add icons instead of letters
- Make Qibla arrow and compass better looking, and more smooth change when turning, maybe have like one arrow direction that is set already and do not move, and then another arrow for the direction ones head is pointing
- Framer motion
- UI/UX skill
- Make the app more nice with animations, gradients, and texture that will make it feel more professional
- Adhan sound for notification
- Numan Bashir adhan sound

Qibla compass: web/iPhone Safari compass support is different from native Expo. We would need a separate web compass implementation using browser motion/orientation APIs.
