import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_SETTINGS,
  PRAYER_NAMES,
  asrMethodOptions,
  calculationMethodOptions,
} from '../constants/settings';
import type {
  AppSettings,
  AsrMethod,
  CalculationMethodKey,
  NotificationPreference,
  PrayerOffsets,
} from '../types';

const SETTINGS_KEY = 'mysalah:settings';

function isCalculationMethod(value: unknown): value is CalculationMethodKey {
  return calculationMethodOptions.includes(value as CalculationMethodKey);
}

function isAsrMethod(value: unknown): value is AsrMethod {
  return asrMethodOptions.includes(value as AsrMethod);
}

function normalizeOffsets(value: unknown): PrayerOffsets {
  const rawOffsets =
    value && typeof value === 'object'
      ? (value as Partial<Record<keyof PrayerOffsets, unknown>>)
      : {};

  return PRAYER_NAMES.reduce<PrayerOffsets>((offsets, prayerName) => {
    const rawOffset = rawOffsets[prayerName];
    offsets[prayerName] =
      typeof rawOffset === 'number' && Number.isFinite(rawOffset)
        ? Math.max(-60, Math.min(60, Math.round(rawOffset)))
        : DEFAULT_SETTINGS.offsets[prayerName];

    return offsets;
  }, { ...DEFAULT_SETTINGS.offsets });
}

function normalizeNotifications(value: unknown): NotificationPreference {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS.notifications;
  }

  const rawPreference = value as Partial<NotificationPreference>;

  return {
    enabled:
      typeof rawPreference.enabled === 'boolean'
        ? rawPreference.enabled
        : DEFAULT_SETTINGS.notifications.enabled,
    reminderMinutes:
      typeof rawPreference.reminderMinutes === 'number' &&
      Number.isFinite(rawPreference.reminderMinutes)
        ? Math.max(0, Math.min(60, Math.round(rawPreference.reminderMinutes)))
        : DEFAULT_SETTINGS.notifications.reminderMinutes,
  };
}

function normalizeSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') {
    return DEFAULT_SETTINGS;
  }

  const rawSettings = value as Partial<AppSettings>;

  return {
    asrMethod: isAsrMethod(rawSettings.asrMethod)
      ? rawSettings.asrMethod
      : DEFAULT_SETTINGS.asrMethod,
    calculationMethod: isCalculationMethod(rawSettings.calculationMethod)
      ? rawSettings.calculationMethod
      : DEFAULT_SETTINGS.calculationMethod,
    notifications: normalizeNotifications(rawSettings.notifications),
    offsets: normalizeOffsets(rawSettings.offsets),
  };
}

export async function loadSettings(): Promise<AppSettings> {
  const rawSettings = await AsyncStorage.getItem(SETTINGS_KEY);

  if (!rawSettings) {
    return DEFAULT_SETTINGS;
  }

  try {
    return normalizeSettings(JSON.parse(rawSettings));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
