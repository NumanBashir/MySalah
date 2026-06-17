import { Coordinates, Qibla } from 'adhan';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { SavedLocation } from '../types';

type OrientationPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

type WebHeadingSource = 'browser' | 'true' | null;

type WebHeadingState = {
  accuracy: number | null;
  error: string | null;
  heading: number | null;
  permissionStatus: OrientationPermission;
  source: WebHeadingSource;
};

type WebDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassAccuracy?: number;
  webkitCompassHeading?: number;
};

type DeviceOrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: (absolute?: boolean) => Promise<OrientationPermission>;
};

const initialHeadingState: WebHeadingState = {
  accuracy: null,
  error: null,
  heading: null,
  permissionStatus: 'prompt',
  source: null,
};

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function getOrientationAngle() {
  if (typeof window.screen?.orientation?.angle === 'number') {
    return window.screen.orientation.angle;
  }

  const legacyWindow = window as Window & { orientation?: number };

  return typeof legacyWindow.orientation === 'number'
    ? legacyWindow.orientation
    : 0;
}

function getDeviceOrientationEvent() {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
    return null;
  }

  return window.DeviceOrientationEvent as DeviceOrientationEventWithPermission;
}

function getAccuracyLevel(event: WebDeviceOrientationEvent) {
  if (typeof event.webkitCompassAccuracy === 'number') {
    if (event.webkitCompassAccuracy <= 20) {
      return 3;
    }

    if (event.webkitCompassAccuracy <= 35) {
      return 2;
    }

    return 1;
  }

  return event.absolute ? 2 : 1;
}

function getHeadingValue(event: WebDeviceOrientationEvent) {
  if (typeof event.webkitCompassHeading === 'number') {
    return {
      source: 'true' as const,
      value: event.webkitCompassHeading,
    };
  }

  if (typeof event.alpha === 'number') {
    return {
      source: 'browser' as const,
      value: 360 - event.alpha + getOrientationAngle(),
    };
  }

  return null;
}

function getHeadingStatusText({
  accuracy,
  error,
  heading,
  permissionStatus,
  source,
}: WebHeadingState) {
  if (permissionStatus === 'unsupported') {
    return 'This browser does not expose compass heading. Try Safari or Chrome on a phone over HTTPS.';
  }

  if (permissionStatus === 'denied') {
    return 'Compass permission was denied. Enable motion and orientation access in Safari settings.';
  }

  if (permissionStatus === 'prompt') {
    return 'Tap Enable compass to start live Qibla direction on this device.';
  }

  if (error) {
    return 'Compass heading is unavailable right now.';
  }

  if (heading === null) {
    return 'Waiting for browser compass heading.';
  }

  if (accuracy === null || accuracy <= 1) {
    return 'Browser compass accuracy is low. Keep the phone flat and move away from magnets or metal.';
  }

  if (source === 'browser') {
    return 'Using browser orientation data. Keep the phone flat and compare once with a known Qibla direction.';
  }

  return 'Keep the phone flat. The arrow updates as you rotate.';
}

export function useQibla(location: SavedLocation) {
  const [headingState, setHeadingState] =
    useState<WebHeadingState>(initialHeadingState);
  const removeListenersRef = useRef<(() => void) | null>(null);

  const qiblaAngle = useMemo(
    () =>
      normalizeDegrees(
        Qibla(new Coordinates(location.latitude, location.longitude)),
      ),
    [location.latitude, location.longitude],
  );

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') {
      setHeadingState((current) => ({
        ...current,
        permissionStatus: 'unsupported',
      }));
      return;
    }

    removeListenersRef.current?.();

    const handleOrientation = (event: Event) => {
      const headingValue = getHeadingValue(event as WebDeviceOrientationEvent);

      if (!headingValue) {
        setHeadingState((current) => ({
          ...current,
          error: 'Heading was missing from browser orientation data.',
        }));
        return;
      }

      setHeadingState({
        accuracy: getAccuracyLevel(event as WebDeviceOrientationEvent),
        error: null,
        heading: normalizeDegrees(headingValue.value),
        permissionStatus: 'granted',
        source: headingValue.source,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);

    removeListenersRef.current = () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener(
        'deviceorientationabsolute',
        handleOrientation,
        true,
      );
    };
  }, []);

  const requestHeadingPermission = useCallback(async () => {
    const orientationEvent = getDeviceOrientationEvent();

    if (!orientationEvent) {
      setHeadingState((current) => ({
        ...current,
        permissionStatus: 'unsupported',
      }));
      return;
    }

    if (typeof orientationEvent.requestPermission === 'function') {
      try {
        const permission = await orientationEvent.requestPermission(true);

        if (permission !== 'granted') {
          setHeadingState((current) => ({
            ...current,
            permissionStatus: 'denied',
          }));
          return;
        }
      } catch (error) {
        setHeadingState((current) => ({
          ...current,
          error:
            error instanceof Error
              ? error.message
              : 'Compass permission request failed.',
          permissionStatus: 'denied',
        }));
        return;
      }
    }

    setHeadingState((current) => ({
      ...current,
      error: null,
      permissionStatus: 'granted',
    }));
    startListening();
  }, [startListening]);

  useEffect(() => {
    const orientationEvent = getDeviceOrientationEvent();

    if (!orientationEvent) {
      setHeadingState((current) => ({
        ...current,
        permissionStatus: 'unsupported',
      }));
      return undefined;
    }

    if (typeof orientationEvent.requestPermission !== 'function') {
      setHeadingState((current) => ({
        ...current,
        error: null,
        permissionStatus: 'granted',
      }));
      startListening();
    }

    return () => {
      removeListenersRef.current?.();
    };
  }, [startListening]);

  const arrowRotation =
    headingState.heading === null
      ? qiblaAngle
      : normalizeDegrees(qiblaAngle - headingState.heading);

  return {
    accuracy: headingState.accuracy,
    arrowRotation,
    canRequestPermission: headingState.permissionStatus === 'prompt',
    heading: headingState.heading,
    headingSource: headingState.source,
    permissionStatus: headingState.permissionStatus,
    qiblaAngle,
    requestHeadingPermission,
    statusText: getHeadingStatusText(headingState),
  };
}
