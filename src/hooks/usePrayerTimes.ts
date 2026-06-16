import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LOCATION } from '../constants/location';
import { DEFAULT_SETTINGS } from '../constants/settings';
import { requestCurrentLocation } from '../services/location';
import { calculatePrayerSchedule } from '../services/prayerTimes';
import { loadSavedLocation, saveLocation } from '../storage/locationStorage';
import { loadSettings, saveSettings } from '../storage/settingsStorage';
import type {
  AppSettings,
  AsrMethod,
  CalculationMethodKey,
  LocationSource,
  LocationStatus,
  PrayerName,
  SavedLocation,
} from '../types';
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
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

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

  const selectTestLocation = useCallback(async (testLocation: SavedLocation) => {
    const nextLocation = {
      ...testLocation,
      updatedAt: new Date().toISOString(),
    };

    setLocation(nextLocation);
    setLocationSource('saved');
    setLocationStatus('ready');
    await saveLocation(nextLocation);
  }, []);

  const persistSettings = useCallback((nextSettings: AppSettings) => {
    setSettings(nextSettings);
    void saveSettings(nextSettings);
  }, []);

  const updateCalculationMethod = useCallback(
    (calculationMethod: CalculationMethodKey) => {
      persistSettings({
        ...settings,
        calculationMethod,
      });
    },
    [persistSettings, settings],
  );

  const updateAsrMethod = useCallback(
    (asrMethod: AsrMethod) => {
      persistSettings({
        ...settings,
        asrMethod,
      });
    },
    [persistSettings, settings],
  );

  const updateOffset = useCallback(
    (prayerName: PrayerName, offset: number) => {
      persistSettings({
        ...settings,
        offsets: {
          ...settings.offsets,
          [prayerName]: Math.max(-60, Math.min(60, Math.round(offset))),
        },
      });
    },
    [persistSettings, settings],
  );

  const toggleNotifications = useCallback(() => {
    persistSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        enabled: !settings.notifications.enabled,
      },
    });
  }, [persistSettings, settings]);

  const updateReminderMinutes = useCallback(
    (reminderMinutes: number) => {
      persistSettings({
        ...settings,
        notifications: {
          ...settings.notifications,
          reminderMinutes: Math.max(0, Math.min(60, Math.round(reminderMinutes))),
        },
      });
    },
    [persistSettings, settings],
  );

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
      const [savedLocation, savedSettings] = await Promise.all([
        loadSavedLocation(),
        loadSettings(),
      ]);

      if (isMounted) {
        setSettings(savedSettings);
      }

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
        settings,
        timeZone: location.timeZone,
      }),
    [location.latitude, location.longitude, location.timeZone, now, settings],
  );

  return {
    countdown: formatCountdown(now, schedule.nextPrayerTime),
    dates: {
      hijri: formatHijriDate(now, location.timeZone),
      gregorian: formatGregorianDate(now, location.timeZone),
    },
    location,
    locationSource,
    locationStatus,
    refreshLocation,
    schedule,
    selectTestLocation,
    settings,
    toggleNotifications,
    updateAsrMethod,
    updateCalculationMethod,
    updateOffset,
    updateReminderMinutes,
  };
}
