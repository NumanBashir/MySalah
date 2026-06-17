import { Coordinates, Qibla } from 'adhan';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import type { SavedLocation } from '../types';

type HeadingState = {
  accuracy: number | null;
  error: string | null;
  heading: number | null;
  isAvailable: boolean;
  source: 'true' | 'magnetic' | null;
};

const initialHeadingState: HeadingState = {
  accuracy: null,
  error: null,
  heading: null,
  isAvailable: Platform.OS !== 'web',
  source: null,
};

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function getHeadingValue(heading: Location.LocationHeadingObject) {
  if (heading.trueHeading >= 0) {
    return {
      source: 'true' as const,
      value: heading.trueHeading,
    };
  }

  return {
    source: 'magnetic' as const,
    value: heading.magHeading,
  };
}

function getHeadingStatusText({
  accuracy,
  error,
  heading,
  isAvailable,
}: HeadingState) {
  if (!isAvailable) {
    return 'Live compass needs a real iPhone or Android device.';
  }

  if (error) {
    return 'Compass heading is unavailable right now.';
  }

  if (heading === null) {
    return 'Waiting for compass heading.';
  }

  if (accuracy === null || accuracy <= 0) {
    return 'Compass accuracy is unavailable. Move away from magnets or metal.';
  }

  if (accuracy === 1) {
    return 'Compass accuracy is low. Keep the phone flat and move away from magnets or metal.';
  }

  return 'Keep the phone flat. The arrow updates as you rotate.';
}

export function useQibla(location: SavedLocation) {
  const [headingState, setHeadingState] =
    useState<HeadingState>(initialHeadingState);

  const qiblaAngle = useMemo(
    () =>
      normalizeDegrees(
        Qibla(new Coordinates(location.latitude, location.longitude)),
      ),
    [location.latitude, location.longitude],
  );

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    if (Platform.OS === 'web') {
      setHeadingState({
        ...initialHeadingState,
        isAvailable: false,
      });
      return undefined;
    }

    setHeadingState((current) => ({
      ...current,
      error: null,
      isAvailable: true,
    }));

    async function watchHeading() {
      try {
        const nextSubscription = await Location.watchHeadingAsync(
          (heading) => {
            if (!isMounted) {
              return;
            }

            const headingValue = getHeadingValue(heading);

            setHeadingState({
              accuracy: heading.accuracy,
              error: null,
              heading: normalizeDegrees(headingValue.value),
              isAvailable: true,
              source: headingValue.source,
            });
          },
          (error) => {
            if (isMounted) {
              setHeadingState((current) => ({
                ...current,
                error,
                isAvailable: false,
              }));
            }
          },
        );

        if (!isMounted) {
          nextSubscription.remove();
          return;
        }

        subscription = nextSubscription;
      } catch (error) {
        if (isMounted) {
          setHeadingState((current) => ({
            ...current,
            error: error instanceof Error ? error.message : 'Heading failed',
            isAvailable: false,
          }));
        }
      }
    }

    watchHeading();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  const arrowRotation =
    headingState.heading === null
      ? qiblaAngle
      : normalizeDegrees(qiblaAngle - headingState.heading);

  return {
    accuracy: headingState.accuracy,
    arrowRotation,
    heading: headingState.heading,
    headingSource: headingState.source,
    qiblaAngle,
    statusText: getHeadingStatusText(headingState),
  };
}
