import AsyncStorage from '@react-native-async-storage/async-storage';

type NominatimAddress = {
  borough?: string;
  city?: string;
  city_district?: string;
  country?: string;
  county?: string;
  municipality?: string;
  state?: string;
  suburb?: string;
  town?: string;
  village?: string;
};

type NominatimReverseResponse = {
  address?: NominatimAddress;
  display_name?: string;
};

const cacheKeyPrefix = 'mysalah:web-reverse-geocode';
const nominatimReverseUrl = 'https://nominatim.openstreetmap.org/reverse';

function getRoundedCoordinate(value: number) {
  return Number(value.toFixed(3));
}

function getCacheKey(latitude: number, longitude: number) {
  return `${cacheKeyPrefix}:${getRoundedCoordinate(latitude)},${getRoundedCoordinate(
    longitude,
  )}`;
}

function getPlaceName(address: NominatimAddress) {
  return (
    address.city ??
    address.town ??
    address.municipality ??
    address.village ??
    address.suburb ??
    address.city_district ??
    address.borough ??
    address.county ??
    address.state ??
    null
  );
}

function getLabelFromReverseResponse(response: NominatimReverseResponse) {
  const address = response.address;

  if (address) {
    const place = getPlaceName(address);
    const country = address.country;

    if (place && country) {
      return `${place}, ${country}`;
    }

    if (place ?? country) {
      return place ?? country ?? null;
    }
  }

  return response.display_name?.split(',').slice(0, 2).join(',').trim() ?? null;
}

export async function getWebReverseGeocodedLabel(
  latitude: number,
  longitude: number,
) {
  const cacheKey = getCacheKey(latitude, longitude);
  const cachedLabel = await AsyncStorage.getItem(cacheKey);

  if (cachedLabel) {
    return cachedLabel;
  }

  const roundedLatitude = getRoundedCoordinate(latitude);
  const roundedLongitude = getRoundedCoordinate(longitude);
  const url = new URL(nominatimReverseUrl);

  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(roundedLatitude));
  url.searchParams.set('lon', String(roundedLongitude));
  url.searchParams.set('zoom', '14');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as NominatimReverseResponse;
    const label = getLabelFromReverseResponse(data);

    if (label) {
      await AsyncStorage.setItem(cacheKey, label);
    }

    return label;
  } catch {
    return null;
  }
}
