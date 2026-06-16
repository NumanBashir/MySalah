import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LOCATION } from '../constants/location';
import { requestCurrentLocation } from '../services/location';
import { calculatePrayerSchedule } from '../services/prayerTimes';
import { loadSavedLocation, saveLocation } from '../storage/locationStorage';
import type { LocationSource, LocationStatus, SavedLocation } from '../types';
import {
  formatCountdown,
  formatGregorianDate,
  formatHijriDate,
} from '../utils/date';

export function usePrayerTimes() {
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<SavedLocation>(DEFAULT_LOCATION);
  const [locationSource, setLocationSource] =
    useState<LocationSource>('default');
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>('loading');

  const refreshLocation = useCallback(async () => {
    setLocationStatus('loading');

    const result = await requestCurrentLocation();

    if (result.status === 'granted') {
      setLocation(result.location);
      setLocationSource('current');
      setLocationStatus('ready');
      await saveLocation(result.location);
      return;
    }

    setLocationStatus(
      result.status === 'denied' ? 'permission-denied' : 'unavailable',
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadLocation() {
      const savedLocation = await loadSavedLocation();

      if (savedLocation && isMounted) {
        setLocation(savedLocation);
        setLocationSource('saved');
        setLocationStatus('ready');
        return;
      }

      if (isMounted) {
        await refreshLocation();
      }
    }

    loadLocation();

    return () => {
      isMounted = false;
    };
  }, [refreshLocation]);

  const schedule = useMemo(
    () =>
      calculatePrayerSchedule({
        date: now,
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    [location.latitude, location.longitude, now],
  );

  return {
    countdown: formatCountdown(now, schedule.nextPrayerTime),
    dates: {
      gregorian: formatGregorianDate(now),
      hijri: formatHijriDate(now),
    },
    location,
    locationSource,
    locationStatus,
    refreshLocation,
    schedule,
  };
}
