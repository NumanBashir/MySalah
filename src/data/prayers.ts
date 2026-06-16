import type { PrayerTime } from '../types';

export const mockPrayerTimes: PrayerTime[] = [
  { name: 'fajr', time: '03:11' },
  { name: 'sunrise', time: '04:25' },
  { name: 'dhuhr', time: '13:12' },
  { name: 'asr', time: '17:34' },
  { name: 'maghrib', time: '22:03' },
  { name: 'isha', time: '23:32' },
];

export const settingsPreview = [
  {
    description: 'Use saved coordinates until GPS is connected.',
    label: 'Location',
    value: 'Copenhagen',
  },
  {
    description: 'Good general default before local mosque comparison.',
    label: 'Calculation method',
    value: 'Muslim World League',
  },
  {
    description: 'Shafi, Maliki, and Hanbali timing.',
    label: 'Asr method',
    value: 'Standard',
  },
  {
    description: 'Local reminders before each prayer.',
    label: 'Notifications',
    value: '5 min',
  },
];
