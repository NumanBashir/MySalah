import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from 'adhan';

import type { PrayerName, PrayerSchedule, PrayerTime } from '../types';
import { formatTime } from '../utils/date';

const orderedPrayerNames: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

const highLatitudeRuleLabels: Record<string, string> = {
  middleofthenight: 'Middle of the night',
  seventhofthenight: 'Seventh of the night',
  twilightangle: 'Twilight angle',
};

function toPrayerName(value: string): PrayerName | null {
  return orderedPrayerNames.includes(value as PrayerName)
    ? (value as PrayerName)
    : null;
}

function getTimestamp(prayerTimes: PrayerTimes, prayerName: PrayerName) {
  return prayerTimes[prayerName];
}

function getPrayerTimes(prayerTimes: PrayerTimes): PrayerTime[] {
  return orderedPrayerNames.map((name) => {
    const timestamp = getTimestamp(prayerTimes, name);

    return {
      name,
      time: formatTime(timestamp),
      timestamp,
    };
  });
}

function buildPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date,
) {
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod.MuslimWorldLeague();

  params.madhab = Madhab.Shafi;
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates);

  return {
    highLatitudeRule: params.highLatitudeRule,
    prayerTimes: new PrayerTimes(coordinates, date, params),
  };
}

export function calculatePrayerSchedule({
  date,
  latitude,
  longitude,
}: {
  date: Date;
  latitude: number;
  longitude: number;
}): PrayerSchedule {
  const { highLatitudeRule, prayerTimes } = buildPrayerTimes(
    latitude,
    longitude,
    date,
  );
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);
  const { prayerTimes: tomorrowPrayerTimes } = buildPrayerTimes(
    latitude,
    longitude,
    tomorrow,
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
