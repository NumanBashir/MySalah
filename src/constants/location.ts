import type { SavedLocation } from '../types';

export const DEFAULT_LOCATION: SavedLocation = {
  label: 'Copenhagen, Denmark',
  latitude: 55.6761,
  longitude: 12.5683,
  timeZone: 'Europe/Copenhagen',
  updatedAt: new Date(0).toISOString(),
};

export const TEST_LOCATIONS: SavedLocation[] = [
  {
    label: 'Copenhagen, Denmark',
    latitude: 55.6761,
    longitude: 12.5683,
    timeZone: 'Europe/Copenhagen',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Makkah, Saudi Arabia',
    latitude: 21.4225,
    longitude: 39.8262,
    timeZone: 'Asia/Riyadh',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Jakarta, Indonesia',
    latitude: -6.2088,
    longitude: 106.8456,
    timeZone: 'Asia/Jakarta',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Reykjavik, Iceland',
    latitude: 64.1466,
    longitude: -21.9426,
    timeZone: 'Atlantic/Reykjavik',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Cape Town, South Africa',
    latitude: -33.9249,
    longitude: 18.4241,
    timeZone: 'Africa/Johannesburg',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timeZone: 'Asia/Tokyo',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'New York, United States',
    latitude: 40.7128,
    longitude: -74.006,
    timeZone: 'America/New_York',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Santiago, Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    timeZone: 'America/Santiago',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Tromso, Norway',
    latitude: 69.6492,
    longitude: 18.9553,
    timeZone: 'Europe/Oslo',
    updatedAt: new Date(0).toISOString(),
  },
  {
    label: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    timeZone: 'Australia/Sydney',
    updatedAt: new Date(0).toISOString(),
  },
];
