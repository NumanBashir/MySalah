import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_LOCATION, TEST_LOCATIONS } from '../constants/location';
import { normalizeLocationLabel } from '../services/locationLabel';
import type { SavedLocation } from '../types';

const LAST_LOCATION_KEY = 'mysalah:last-location';

function isSavedLocation(value: unknown): value is SavedLocation {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const location = value as Partial<SavedLocation>;

  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    typeof location.label === 'string' &&
    (typeof location.timeZone === 'string' ||
      typeof location.timeZone === 'undefined') &&
    typeof location.updatedAt === 'string'
  );
}

function normalizeSavedLocation(location: SavedLocation): SavedLocation {
  const matchingTestLocation = TEST_LOCATIONS.find(
    (testLocation) =>
      testLocation.label === location.label &&
      Math.abs(testLocation.latitude - location.latitude) < 0.001 &&
      Math.abs(testLocation.longitude - location.longitude) < 0.001,
  );

  return normalizeLocationLabel({
    ...location,
    timeZone:
      location.timeZone ??
      matchingTestLocation?.timeZone ??
      DEFAULT_LOCATION.timeZone,
  });
}

export async function loadSavedLocation(): Promise<SavedLocation | null> {
  const rawLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);

  if (!rawLocation) {
    return null;
  }

  try {
    const parsedLocation: unknown = JSON.parse(rawLocation);
    return isSavedLocation(parsedLocation)
      ? normalizeSavedLocation(parsedLocation)
      : null;
  } catch {
    return null;
  }
}

export async function saveLocation(location: SavedLocation) {
  await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}
