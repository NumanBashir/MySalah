import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { PrayerName, PrayerTime, SavedLocation } from "../types";

const CHANNEL_ID = "prayer-reminders";
const OWNER = "mysalah";
const PRAYER_KIND = "prayer-reminder";
const TEST_KIND = "test-notification";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    priority: Notifications.AndroidNotificationPriority.HIGH,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NotificationScheduleResult =
  | { count: number; status: "scheduled" }
  | { count: 0; status: "disabled" | "permission-denied" | "unsupported" };

const prayerLabels: Record<PrayerName, string> = {
  asr: "Asr",
  dhuhr: "Dhuhr",
  fajr: "Fajr",
  isha: "Isha",
  maghrib: "Maghrib",
  sunrise: "Sunrise",
};

function isNativeNotificationsSupported() {
  return Platform.OS === "ios" || Platform.OS === "android";
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    importance: Notifications.AndroidImportance.HIGH,
    name: "Prayer reminders",
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function requestNotificationPermission() {
  if (!isNativeNotificationsSupported()) {
    return false;
  }

  await ensureAndroidChannel();

  const existingPermission = await Notifications.getPermissionsAsync();

  if (existingPermission.granted) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requestedPermission.granted;
}

async function cancelPrayerReminderNotifications() {
  if (!isNativeNotificationsSupported()) {
    return;
  }

  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduledNotifications
      .filter(
        (notification) =>
          notification.content.data?.owner === OWNER &&
          notification.content.data?.kind === PRAYER_KIND,
      )
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );
}

export async function schedulePrayerReminderNotifications({
  enabled,
  location,
  prayerTimes,
  reminderMinutes,
}: {
  enabled: boolean;
  location: SavedLocation;
  prayerTimes: PrayerTime[];
  reminderMinutes: number;
}): Promise<NotificationScheduleResult> {
  if (!isNativeNotificationsSupported()) {
    return { count: 0, status: "unsupported" };
  }

  await cancelPrayerReminderNotifications();

  if (!enabled) {
    return { count: 0, status: "disabled" };
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return { count: 0, status: "permission-denied" };
  }

  const now = new Date();
  const scheduledPrayerTimes = prayerTimes.filter((prayerTime) => {
    const reminderAt = new Date(
      prayerTime.timestamp.getTime() - reminderMinutes * 60000,
    );
    return reminderAt > now;
  });

  await Promise.all(
    scheduledPrayerTimes.map((prayerTime) => {
      const reminderAt = new Date(
        prayerTime.timestamp.getTime() - reminderMinutes * 60000,
      );

      return Notifications.scheduleNotificationAsync({
        content: {
          body: `${prayerLabels[prayerTime.name]} is at ${prayerTime.time} in ${location.label}.`,
          data: {
            kind: PRAYER_KIND,
            owner: OWNER,
            prayerName: prayerTime.name,
          },
          sound: true,
          title: `${prayerLabels[prayerTime.name]} in ${reminderMinutes} min`,
        },
        trigger: {
          channelId: CHANNEL_ID,
          date: reminderAt,
          type: Notifications.SchedulableTriggerInputTypes.DATE,
        },
      });
    }),
  );

  return {
    count: scheduledPrayerTimes.length,
    status: "scheduled",
  };
}

export async function scheduleTestNotification() {
  if (!isNativeNotificationsSupported()) {
    return { status: "unsupported" as const };
  }

  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return { status: "permission-denied" as const };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      body: "This confirms MySalah local notifications are working.",
      data: {
        kind: TEST_KIND,
        owner: OWNER,
      },
      sound: true,
      title: "MySalah test reminder",
    },
    trigger: {
      channelId: CHANNEL_ID,
      seconds: 5,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return { status: "scheduled" as const };
}
