import type {
  AppSettings,
  AsrMethod,
  CalculationMethodKey,
  PrayerName,
} from '../types';

export const PRAYER_NAMES: PrayerName[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const DEFAULT_SETTINGS: AppSettings = {
  asrMethod: 'standard',
  calculationMethod: 'MuslimWorldLeague',
  notifications: {
    enabled: true,
    reminderMinutes: 5,
  },
  offsets: {
    asr: 0,
    dhuhr: 0,
    fajr: 0,
    isha: 0,
    maghrib: 0,
    sunrise: 0,
  },
};

export const calculationMethodLabels: Record<CalculationMethodKey, string> = {
  MoonsightingCommittee: 'Moonsighting',
  MuslimWorldLeague: 'Muslim World League',
  Other: 'Custom',
  Turkey: 'Turkey',
  UmmAlQura: 'Umm al-Qura',
};

export const calculationMethodOptions: CalculationMethodKey[] = [
  'MuslimWorldLeague',
  'MoonsightingCommittee',
  'UmmAlQura',
  'Turkey',
  'Other',
];

export const asrMethodLabels: Record<AsrMethod, string> = {
  hanafi: 'Hanafi',
  standard: 'Standard',
};

export const asrMethodOptions: AsrMethod[] = ['standard', 'hanafi'];
