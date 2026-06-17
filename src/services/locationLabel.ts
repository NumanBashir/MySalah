import { DEFAULT_LOCATION, TEST_LOCATIONS } from '../constants/location';
import type { SavedLocation } from '../types';

type KnownLocation = {
  label: string;
  latitude: number;
  longitude: number;
};

const coordinateLabelPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
const localAreaThresholdKm = 8;
const regionalCityThresholdKm = 75;

const copenhagenAreaLocations: KnownLocation[] = [
  { label: 'Copenhagen, Denmark', latitude: 55.6761, longitude: 12.5683 },
  { label: 'Frederiksberg, Denmark', latitude: 55.6786, longitude: 12.5319 },
  { label: 'Glostrup, Denmark', latitude: 55.6666, longitude: 12.4038 },
  { label: 'Albertslund, Denmark', latitude: 55.6569, longitude: 12.3638 },
  { label: 'Ballerup, Denmark', latitude: 55.7317, longitude: 12.3633 },
  { label: 'Brondby, Denmark', latitude: 55.648, longitude: 12.418 },
  { label: 'Dragor, Denmark', latitude: 55.5946, longitude: 12.6726 },
  { label: 'Gentofte, Denmark', latitude: 55.7457, longitude: 12.5481 },
  { label: 'Herlev, Denmark', latitude: 55.7237, longitude: 12.4391 },
  { label: 'Hvidovre, Denmark', latitude: 55.6425, longitude: 12.4754 },
  { label: 'Ishoj, Denmark', latitude: 55.6154, longitude: 12.3518 },
  { label: 'Lyngby, Denmark', latitude: 55.7704, longitude: 12.5038 },
  { label: 'Roskilde, Denmark', latitude: 55.6419, longitude: 12.0878 },
  { label: 'Rodovre, Denmark', latitude: 55.6806, longitude: 12.4537 },
  { label: 'Taastrup, Denmark', latitude: 55.6517, longitude: 12.2922 },
  { label: 'Tarnby, Denmark', latitude: 55.6303, longitude: 12.6004 },
  { label: 'Vallensbaek, Denmark', latitude: 55.6214, longitude: 12.3854 },
];

const regionalLocations: KnownLocation[] = [
  { label: 'Aarhus, Denmark', latitude: 56.1629, longitude: 10.2039 },
  { label: 'Odense, Denmark', latitude: 55.4038, longitude: 10.4024 },
  { label: 'Aalborg, Denmark', latitude: 57.0488, longitude: 9.9217 },
  { label: 'Esbjerg, Denmark', latitude: 55.4765, longitude: 8.4594 },
  { label: 'Randers, Denmark', latitude: 56.4606, longitude: 10.0364 },
  { label: 'Kolding, Denmark', latitude: 55.4904, longitude: 9.4722 },
  { label: 'Horsens, Denmark', latitude: 55.8607, longitude: 9.8503 },
  { label: 'Vejle, Denmark', latitude: 55.7113, longitude: 9.5364 },
  { label: 'Roskilde, Denmark', latitude: 55.6419, longitude: 12.0878 },
  { label: 'Herning, Denmark', latitude: 56.1393, longitude: 8.9738 },
  { label: 'Helsingor, Denmark', latitude: 56.0361, longitude: 12.6136 },
];

const localAreaLocations: KnownLocation[] = [
  ...copenhagenAreaLocations,
  ...TEST_LOCATIONS,
];

const regionalKnownLocations: KnownLocation[] = [
  DEFAULT_LOCATION,
  ...regionalLocations,
  ...TEST_LOCATIONS,
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(
  first: Pick<KnownLocation, 'latitude' | 'longitude'>,
  second: Pick<KnownLocation, 'latitude' | 'longitude'>,
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.sin(longitudeDelta / 2) ** 2 *
      Math.cos(firstLatitude) *
      Math.cos(secondLatitude);

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function formatCoordinateLabel(latitude: number, longitude: number) {
  return `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
}

export function getNearestKnownLocationLabel(
  latitude: number,
  longitude: number,
) {
  const nearestLocalArea = getNearestLocationLabel(
    latitude,
    longitude,
    localAreaLocations,
    localAreaThresholdKm,
  );

  if (nearestLocalArea) {
    return nearestLocalArea;
  }

  return getNearestLocationLabel(
    latitude,
    longitude,
    regionalKnownLocations,
    regionalCityThresholdKm,
  );
}

function getNearestLocationLabel(
  latitude: number,
  longitude: number,
  locations: KnownLocation[],
  thresholdKm: number,
) {
  const nearestLocation = locations
    .map((location) => ({
      distanceKm: getDistanceKm({ latitude, longitude }, location),
      label: location.label,
    }))
    .sort((first, second) => first.distanceKm - second.distanceKm)[0];

  return nearestLocation?.distanceKm <= thresholdKm
    ? nearestLocation.label
    : null;
}

export function getFallbackLocationLabel(latitude: number, longitude: number) {
  return (
    getNearestKnownLocationLabel(latitude, longitude) ??
    formatCoordinateLabel(latitude, longitude)
  );
}

export function normalizeLocationLabel(location: SavedLocation) {
  if (!coordinateLabelPattern.test(location.label.trim())) {
    return location;
  }

  return {
    ...location,
    label: getFallbackLocationLabel(location.latitude, location.longitude),
  };
}
