import * as Location from 'expo-location';

import { getFallbackLocationLabel } from './locationLabel';
import type { SavedLocation } from '../types';

type LocationResult =
  | { location: SavedLocation; status: 'granted' }
  | { status: 'denied' | 'unavailable' };

async function getLocationLabel(latitude: number, longitude: number) {
  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!place) {
      return getFallbackLocationLabel(latitude, longitude);
    }

    const city = place.city ?? place.subregion ?? place.region;
    const country = place.country ?? place.isoCountryCode;

    if (city && country) {
      return `${city}, ${country}`;
    }

    return city ?? country ?? getFallbackLocationLabel(latitude, longitude);
  } catch {
    return getFallbackLocationLabel(latitude, longitude);
  }
}

export async function requestCurrentLocation(): Promise<LocationResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return { status: 'denied' };
    }

    const currentLocation = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = currentLocation.coords;
    const label = await getLocationLabel(latitude, longitude);

    return {
      location: {
        label,
        latitude,
        longitude,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        updatedAt: new Date().toISOString(),
      },
      status: 'granted',
    };
  } catch {
    return { status: 'unavailable' };
  }
}
