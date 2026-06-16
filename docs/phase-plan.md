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

- Store location, calculation method, Asr method, offsets, and notification preference
- Load saved state on startup
- Use saved coordinates when offline or permission is unavailable
- Add clear fallback states for missing location

## Phase 4: Notifications

Goal: schedule simple local reminders.

- Request notification permission
- Schedule reminders 5 minutes before prayers
- Skip expired reminders for the current day
- Reschedule on date, location, setting, or notification preference changes
- Verify on a real iPhone

## Phase 5: Settings

Goal: make calculation and reminder behavior adjustable without clutter.

- Calculation method picker
- Asr method picker
- Manual offsets per prayer
- Notification enable/disable
- Location refresh action
- Accuracy note

## Phase 6: Qibla

Goal: add real-time Qibla direction.

- Calculate Qibla angle from stored/current coordinates
- Read device heading
- Rotate Qibla arrow in real time
- Add simple sensor guidance
- Handle unavailable or unreliable heading

## Phase 7: Personal Testing

Goal: make the app reliable enough for daily use.

- Compare against local mosque timetable for 7-14 days
- Tune calculation method and offsets
- Test offline launch behavior
- Test notifications after app restarts
- Test Qibla outdoors and indoors

## Phase 8: TestFlight Prep

Goal: prepare private distribution.

- App icon
- Screenshots
- Privacy details
- Basic support contact
- Internal tester feedback loop
