import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

import { PRAYER_NAMES } from '../constants/settings';
import type {
  AppSettings,
  CalculationMethodKey,
  PrayerName,
  PrayerSchedule,
  PrayerTime,
} from '../types';
import { formatTime } from '../utils/date';

const highLatitudeRuleLabels: Record<string, string> = {
  middleofthenight: 'Middle of the night',
  seventhofthenight: 'Seventh of the night',
  twilightangle: 'Twilight angle',
};

function toPrayerName(value: string): PrayerName | null {
  return PRAYER_NAMES.includes(value as PrayerName)
    ? (value as PrayerName)
    : null;
}

function getTimestamp(prayerTimes: PrayerTimes, prayerName: PrayerName) {
  return prayerTimes[prayerName];
}

function getPrayerTimes(prayerTimes: PrayerTimes): PrayerTime[] {
  return PRAYER_NAMES.map((name) => {
    const timestamp = getTimestamp(prayerTimes, name);

    return {
      name,
      time: formatTime(timestamp),
      timestamp,
    };
  });
}

function getCalculationParameters(method: CalculationMethodKey) {
  switch (method) {
    case 'MoonsightingCommittee':
      return CalculationMethod.MoonsightingCommittee();
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'Turkey':
      return CalculationMethod.Turkey();
    case 'Other':
      return CalculationMethod.Other();
    case 'MuslimWorldLeague':
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

function buildPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
  settings: AppSettings,
) {
  const coordinates = new Coordinates(latitude, longitude);
  const params = getCalculationParameters(settings.calculationMethod);

  params.madhab =
    settings.asrMethod === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);
  params.adjustments = settings.offsets;

  return {
    highLatitudeRule: params.highLatitudeRule,
    prayerTimes: new PrayerTimes(coordinates, date, params),
  };
}

export function calculatePrayerSchedule({
  date,
  latitude,
  longitude,
  settings,
}: {
  date: Date;
  latitude: number;
  longitude: number;
  settings: AppSettings;
}): PrayerSchedule {
  const { highLatitudeRule, prayerTimes } = buildPrayerTimes(
    latitude,
    longitude,
    date,
    settings,
  );
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const { prayerTimes: tomorrowPrayerTimes } = buildPrayerTimes(
    latitude,
    longitude,
    tomorrow,
    settings,
  );

  const currentPrayerName = toPrayerName(prayerTimes.currentPrayer(date));
  const nextPrayerToday = toPrayerName(prayerTimes.nextPrayer(date));
  const nextPrayerName = nextPrayerToday ?? 'fajr';
  const nextPrayerTime = nextPrayerToday
    ? getTimestamp(prayerTimes, nextPrayerToday)
    : tomorrowPrayerTimes.fajr;

  return {
    activePrayerName: currentPrayerName ?? nextPrayerName,
    currentPrayerName,
    highLatitudeRule:
      highLatitudeRuleLabels[highLatitudeRule] ?? highLatitudeRule,
    nextPrayerName,
    nextPrayerTime,
    prayerTimes: getPrayerTimes(prayerTimes),
  };
}
