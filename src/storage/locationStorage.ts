import AsyncStorage from '@react-native-async-storage/async-storage';

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
    typeof location.updatedAt === 'string'
  );
}

export async function loadSavedLocation(): Promise<SavedLocation | null> {
  const rawLocation = await AsyncStorage.getItem(LAST_LOCATION_KEY);

  if (!rawLocation) {
    return null;
  }

  try {
    const parsedLocation: unknown = JSON.parse(rawLocation);
    return isSavedLocation(parsedLocation) ? parsedLocation : null;
  } catch {
    return null;
  }
}

export async function saveLocation(location: SavedLocation) {
  await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
}
