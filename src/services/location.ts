import * as Location from 'expo-location';

import type { SavedLocation } from '../types';

type LocationResult =
  | { location: SavedLocation; status: 'granted' }
  | { status: 'denied' | 'unavailable' };

function formatCoordinateLabel(latitude: number, longitude: number) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

async function getLocationLabel(latitude: number, longitude: number) {
  try {
    const [place] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!place) {
      return formatCoordinateLabel(latitude, longitude);
    }

    const city = place.city ?? place.subregion ?? place.region;
    const country = place.country ?? place.isoCountryCode;

    if (city && country) {
      return `${city}, ${country}`;
    }

    return city ?? country ?? formatCoordinateLabel(latitude, longitude);
  } catch {
    return formatCoordinateLabel(latitude, longitude);
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
        updatedAt: new Date().toISOString(),
      },
      status: 'granted',
    };
  } catch {
    return { status: 'unavailable' };
  }
}
