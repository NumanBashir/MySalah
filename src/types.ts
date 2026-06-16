export type PrayerName =
  | 'fajr'
  | 'sunrise'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha';

export type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'MoonsightingCommittee'
  | 'UmmAlQura'
  | 'Turkey'
  | 'Other';

export type AsrMethod = 'standard' | 'hanafi';

export type PrayerOffsets = Record<PrayerName, number>;

export type NotificationPreference = {
  enabled: boolean;
  reminderMinutes: number;
};

export type AppSettings = {
  calculationMethod: CalculationMethodKey;
  asrMethod: AsrMethod;
  offsets: PrayerOffsets;
  notifications: NotificationPreference;
};

export type PrayerTime = {
  name: PrayerName;
  timestamp: Date;
  time: string;
};

export type SavedLocation = {
  latitude: number;
  longitude: number;
  label: string;
  timeZone: string;
  updatedAt: string;
};

export type LocationSource = 'current' | 'saved' | 'default';

export type LocationStatus =
  | 'loading'
  | 'ready'
  | 'permission-denied'
  | 'unavailable';

export type PrayerSchedule = {
  activePrayerName: PrayerName;
  currentPrayerName: PrayerName | null;
  highLatitudeRule: string;
  nextPrayerName: PrayerName;
  nextPrayerTime: Date;
  prayerTimes: PrayerTime[];
};
