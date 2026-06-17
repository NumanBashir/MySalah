import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  PRAYER_NAMES,
  asrMethodLabels,
  asrMethodOptions,
  calculationMethodLabels,
  calculationMethodOptions,
} from "./src/constants/settings";
import { VercelInsights } from "./src/components/VercelInsights";
import { TEST_LOCATIONS } from "./src/constants/location";
import { usePrayerTimes } from "./src/hooks/usePrayerTimes";
import { useQibla } from "./src/hooks/useQibla";
import { colors, radii, spacing, typography } from "./src/theme";
import type { LocationSource, LocationStatus, PrayerName } from "./src/types";
import { formatTime } from "./src/utils/date";

type TabKey = "today" | "qibla" | "settings";

const tabs: Array<{ key: TabKey; label: string; symbol: string }> = [
  { key: "today", label: "Today", symbol: "T" },
  { key: "qibla", label: "Qibla", symbol: "Q" },
  { key: "settings", label: "Settings", symbol: "S" },
];

const prayerLabels: Record<PrayerName, string> = {
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

const webHeadLinks = [
  {
    href: "/manifest.webmanifest",
    id: "mysalah-web-manifest",
    rel: "manifest",
  },
  {
    href: "/apple-touch-icon.png",
    id: "mysalah-apple-touch-icon",
    rel: "apple-touch-icon",
  },
];

const webHeadMeta = [
  {
    content: "yes",
    id: "mysalah-apple-mobile-web-app-capable",
    name: "apple-mobile-web-app-capable",
  },
  {
    content: "MySalah",
    id: "mysalah-apple-mobile-web-app-title",
    name: "apple-mobile-web-app-title",
  },
  {
    content: "default",
    id: "mysalah-apple-mobile-web-app-status-bar-style",
    name: "apple-mobile-web-app-status-bar-style",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const prayerState = usePrayerTimes();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    webHeadLinks.forEach((item) => {
      let link = document.getElementById(item.id) as HTMLLinkElement | null;

      if (!link) {
        link = document.createElement("link");
        link.id = item.id;
        document.head.appendChild(link);
      }

      link.href = item.href;
      link.rel = item.rel;
    });

    webHeadMeta.forEach((item) => {
      let meta = document.getElementById(item.id) as HTMLMetaElement | null;

      if (!meta) {
        meta = document.createElement("meta");
        meta.id = item.id;
        document.head.appendChild(meta);
      }

      meta.content = item.content;
      meta.name = item.name;
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.content}>
          {activeTab === "today" && <TodayScreen prayerState={prayerState} />}
          {activeTab === "qibla" && <QiblaScreen prayerState={prayerState} />}
          {activeTab === "settings" && (
            <SettingsScreen prayerState={prayerState} />
          )}
        </View>
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </View>
      <VercelInsights />
    </SafeAreaView>
  );
}

type PrayerState = ReturnType<typeof usePrayerTimes>;

function TodayScreen({ prayerState }: { prayerState: PrayerState }) {
  const { countdown, dates, location, schedule, settings } = prayerState;

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.location}>{location.label}</Text>
          <View style={styles.dateStack}>
            <Text style={styles.hijriDateText}>{dates.hijri}</Text>
            <Text style={styles.dateText}>{dates.gregorian}</Text>
          </View>
        </View>
      </View>

      <View style={styles.nextPrayerPanel}>
        <Text style={styles.eyebrow}>Next prayer</Text>
        <View style={styles.nextPrayerRow}>
          <View>
            <Text style={styles.nextPrayerName}>
              {prayerLabels[schedule.nextPrayerName]}
            </Text>
            <Text style={styles.countdown}>{countdown}</Text>
          </View>
          <Text style={styles.nextPrayerTime}>
            {formatTime(schedule.nextPrayerTime, location.timeZone)}
          </Text>
        </View>
      </View>

      <View style={styles.prayerList}>
        {schedule.prayerTimes.map((prayer) => (
          <PrayerTimeRow
            key={prayer.name}
            name={prayerLabels[prayer.name]}
            time={prayer.time}
            isNext={prayer.name === schedule.activePrayerName}
          />
        ))}
      </View>

      <View style={styles.infoBand}>
        <Text style={styles.infoBandTitle}>Calculation</Text>
        <Text style={styles.infoBandText}>
          {calculationMethodLabels[settings.calculationMethod]},{" "}
          {asrMethodLabels[settings.asrMethod]} Asr, {schedule.highLatitudeRule}{" "}
          for high-latitude days.
        </Text>
      </View>
    </ScrollView>
  );
}

function getLocationStatusText(status: LocationStatus, source: LocationSource) {
  if (status === "loading") {
    return "Updating location";
  }

  if (status === "permission-denied") {
    return source === "saved"
      ? "Using saved location; GPS permission denied"
      : "Using Copenhagen until GPS is allowed";
  }

  if (status === "unavailable") {
    return source === "saved"
      ? "Using saved location; GPS unavailable"
      : "Using Copenhagen until GPS is available";
  }

  if (source === "saved") {
    return "Using saved location";
  }

  if (source === "default") {
    return "Using Copenhagen preview location";
  }

  return "Using current location";
}

function PrayerTimeRow({
  name,
  time,
  isNext,
}: {
  name: string;
  time: string;
  isNext?: boolean;
}) {
  return (
    <View style={[styles.prayerRow, isNext && styles.prayerRowActive]}>
      <View style={styles.prayerRowLabelGroup}>
        <View style={[styles.prayerDot, isNext && styles.prayerDotActive]} />
        <Text style={[styles.prayerName, isNext && styles.prayerNameActive]}>
          {name}
        </Text>
      </View>
      <Text style={[styles.prayerTime, isNext && styles.prayerTimeActive]}>
        {time}
      </Text>
    </View>
  );
}

function QiblaScreen({ prayerState }: { prayerState: PrayerState }) {
  const { location } = prayerState;
  const qibla = useQibla(location);
  const headingLabel =
    qibla.heading === null
      ? "Waiting"
      : `${Math.round(qibla.heading)} deg ${
          qibla.headingSource === "magnetic" ? "magnetic" : "true"
        }`;
  const accuracyLabel =
    qibla.accuracy === null ? "Unknown" : `${qibla.accuracy}/3`;

  return (
    <ScrollView
      contentContainerStyle={[styles.screenContent, styles.centeredScreen]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.qiblaHeader}>
        <Text style={styles.screenTitle}>Qibla</Text>
        <Text style={styles.screenSubtitle}>{location.label}</Text>
      </View>

      <View style={styles.compass}>
        <Text style={[styles.compassLabel, styles.compassNorth]}>N</Text>
        <Text style={[styles.compassLabel, styles.compassEast]}>E</Text>
        <Text style={[styles.compassLabel, styles.compassSouth]}>S</Text>
        <Text style={[styles.compassLabel, styles.compassWest]}>W</Text>
        <View style={styles.compassInner}>
          <View
            style={[
              styles.qiblaArrow,
              { transform: [{ rotate: `${qibla.arrowRotation}deg` }] },
            ]}
          />
          <Text style={styles.qiblaDegrees}>
            {Math.round(qibla.qiblaAngle)} deg to Qibla
          </Text>
        </View>
      </View>

      <View style={styles.qiblaReadout}>
        <View style={styles.qiblaReadoutItem}>
          <Text style={styles.qiblaReadoutLabel}>Heading</Text>
          <Text style={styles.qiblaReadoutValue}>{headingLabel}</Text>
        </View>
        <View style={styles.qiblaReadoutItem}>
          <Text style={styles.qiblaReadoutLabel}>Accuracy</Text>
          <Text style={styles.qiblaReadoutValue}>{accuracyLabel}</Text>
        </View>
      </View>

      <View style={styles.infoBand}>
        <Text style={styles.infoBandTitle}>Sensor guidance</Text>
        <Text style={styles.infoBandText}>{qibla.statusText}</Text>
      </View>
    </ScrollView>
  );
}

function SettingsScreen({ prayerState }: { prayerState: PrayerState }) {
  const {
    location,
    locationSource,
    locationStatus,
    notificationStatus,
    refreshLocation,
    selectTestLocation,
    sendTestNotification,
    settings,
    toggleNotifications,
    updateAsrMethod,
    updateCalculationMethod,
    updateOffset,
    updateReminderMinutes,
  } = prayerState;

  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.screenTitle}>Settings</Text>
          <Text style={styles.screenSubtitle}>Simple defaults for v1.</Text>
        </View>
      </View>

      <View style={styles.locationPanel}>
        <View style={styles.locationPanelHeader}>
          <View style={styles.locationPanelTextGroup}>
            <Text style={styles.settingLabel}>Location</Text>
            <Text style={styles.settingDescription}>
              {getLocationStatusText(locationStatus, locationSource)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={locationStatus === "loading"}
            onPress={refreshLocation}
            style={[
              styles.locationAction,
              locationStatus === "loading" && styles.locationActionDisabled,
            ]}
          >
            <Text style={styles.locationActionText}>
              {locationStatus === "loading" ? "Updating" : "GPS"}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.settingValue}>{location.label}</Text>
        <Text style={styles.locationTimeZone}>{location.timeZone}</Text>
      </View>

      <View style={styles.locationPanel}>
        <Text style={styles.settingLabel}>Test locations</Text>
        <Text style={styles.settingDescription}>
          Pick a saved city to preview very different prayer times without using
          GPS.
        </Text>
        <View style={styles.testLocationList}>
          {TEST_LOCATIONS.map((testLocation) => {
            const isSelected =
              location.label === testLocation.label &&
              Math.abs(location.latitude - testLocation.latitude) < 0.001 &&
              Math.abs(location.longitude - testLocation.longitude) < 0.001;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={testLocation.label}
                onPress={() => selectTestLocation(testLocation)}
                style={[
                  styles.testLocationButton,
                  isSelected && styles.testLocationButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.testLocationLabel,
                    isSelected && styles.testLocationLabelActive,
                  ]}
                >
                  {testLocation.label}
                </Text>
                <Text
                  style={[
                    styles.testLocationCoordinates,
                    isSelected && styles.testLocationCoordinatesActive,
                  ]}
                >
                  {testLocation.latitude.toFixed(2)},{" "}
                  {testLocation.longitude.toFixed(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.settingsGroup}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Calculation method</Text>
          <Text style={styles.settingDescription}>
            Saved locally and used offline for daily prayer calculations.
          </Text>
          <View style={styles.optionWrap}>
            {calculationMethodOptions.map((method) => (
              <OptionButton
                isSelected={settings.calculationMethod === method}
                key={method}
                label={calculationMethodLabels[method]}
                onPress={() => updateCalculationMethod(method)}
              />
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Asr method</Text>
          <Text style={styles.settingDescription}>
            Standard is used by Shafi, Maliki, and Hanbali schools. Hanafi
            starts later.
          </Text>
          <View style={styles.optionRow}>
            {asrMethodOptions.map((method) => (
              <OptionButton
                isSelected={settings.asrMethod === method}
                key={method}
                label={asrMethodLabels[method]}
                onPress={() => updateAsrMethod(method)}
              />
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Manual offsets</Text>
          <Text style={styles.settingDescription}>
            Adjust each prayer to match a trusted local timetable.
          </Text>
          <View style={styles.offsetList}>
            {PRAYER_NAMES.map((prayerName) => (
              <OffsetControl
                key={prayerName}
                label={prayerLabels[prayerName]}
                onChange={(offset) => updateOffset(prayerName, offset)}
                value={settings.offsets[prayerName]}
              />
            ))}
          </View>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Text style={styles.settingDescription}>
            Local reminders are scheduled for today and refreshed when prayer
            times or settings change.
          </Text>
          <Text style={styles.notificationStatus}>{notificationStatus}</Text>
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={toggleNotifications}
              style={[
                styles.choiceButton,
                settings.notifications.enabled && styles.choiceButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  settings.notifications.enabled &&
                    styles.choiceButtonTextActive,
                ]}
              >
                {settings.notifications.enabled ? "On" : "Off"}
              </Text>
            </Pressable>
            <View style={styles.inlineStepperGroup}>
              <Text style={styles.inlineStepperLabel}>Reminder</Text>
              <StepperControl
                label="Reminder"
                onChange={updateReminderMinutes}
                suffix="min"
                value={settings.notifications.reminderMinutes}
              />
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={sendTestNotification}
            style={styles.testNotificationButton}
          >
            <Text style={styles.testNotificationButtonText}>Test in 5s</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.infoBand}>
        <Text style={styles.infoBandTitle}>Accuracy note</Text>
        <Text style={styles.infoBandText}>
          Prayer times are calculated based on your selected method. For exact
          local practice, compare with your mosque timetable and adjust offsets
          if needed.
        </Text>
      </View>
    </ScrollView>
  );
}

function OptionButton({
  isSelected,
  label,
  onPress,
}: {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={[styles.choiceButton, isSelected && styles.choiceButtonActive]}
    >
      <Text
        style={[
          styles.choiceButtonText,
          isSelected && styles.choiceButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function OffsetControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <View style={styles.offsetRow}>
      <Text style={styles.offsetLabel}>{label}</Text>
      <StepperControl label={label} onChange={onChange} value={value} />
    </View>
  );
}

function StepperControl({
  label,
  onChange,
  suffix = "min",
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  suffix?: string;
  value: number;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        onPress={() => onChange(value - 1)}
        style={styles.stepperButton}
      >
        <Text style={styles.stepperButtonText}>-</Text>
      </Pressable>
      <Text style={styles.stepperValue}>
        {value > 0 ? `+${value}` : value} {suffix}
      </Text>
      <Pressable
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        onPress={() => onChange(value + 1)}
        style={styles.stepperButton}
      >
        <Text style={styles.stepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

function TabBar({
  activeTab,
  onSelectTab,
}: {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
          >
            <View
              style={[styles.tabSymbol, isActive && styles.tabSymbolActive]}
            >
              <Text
                style={[
                  styles.tabSymbolText,
                  isActive && styles.tabSymbolTextActive,
                ]}
              >
                {tab.symbol}
              </Text>
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  screenContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  centeredScreen: {
    alignItems: "center",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  location: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "700",
    lineHeight: 36,
  },
  dateText: {
    color: colors.mutedText,
    fontSize: typography.body,
  },
  dateStack: {
    marginTop: spacing.sm,
  },
  hijriDateText: {
    color: colors.accentDeep,
    fontSize: typography.body,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  locationAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  locationActionDisabled: {
    opacity: 0.6,
  },
  locationActionText: {
    color: colors.accentDeep,
    fontSize: typography.small,
    fontWeight: "800",
  },
  nextPrayerPanel: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  eyebrow: {
    color: colors.onAccentMuted,
    fontSize: typography.small,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  nextPrayerRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  nextPrayerName: {
    color: colors.onAccent,
    fontSize: typography.display,
    fontWeight: "800",
  },
  countdown: {
    color: colors.onAccentMuted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  nextPrayerTime: {
    color: colors.onAccent,
    fontSize: typography.heading,
    fontWeight: "800",
  },
  prayerList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  prayerRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: spacing.lg,
  },
  prayerRowActive: {
    backgroundColor: colors.accentSoft,
  },
  prayerRowLabelGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  prayerDot: {
    backgroundColor: colors.borderStrong,
    borderRadius: radii.full,
    height: 8,
    width: 8,
  },
  prayerDotActive: {
    backgroundColor: colors.accent,
  },
  prayerName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "600",
  },
  prayerNameActive: {
    color: colors.accentDeep,
  },
  prayerTime: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  prayerTimeActive: {
    color: colors.accentDeep,
  },
  qiblaHeader: {
    alignSelf: "stretch",
    marginBottom: spacing.xl,
  },
  screenTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "800",
  },
  screenSubtitle: {
    color: colors.mutedText,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  compass: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 160,
    borderWidth: 1,
    justifyContent: "center",
    maxWidth: 320,
    position: "relative",
    width: "100%",
  },
  compassInner: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 105,
    borderWidth: 1,
    height: 210,
    justifyContent: "center",
    width: 210,
  },
  compassLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "800",
    position: "absolute",
  },
  compassNorth: {
    top: spacing.lg,
  },
  compassEast: {
    right: spacing.lg,
  },
  compassSouth: {
    bottom: spacing.lg,
  },
  compassWest: {
    left: spacing.lg,
  },
  qiblaArrow: {
    borderBottomColor: colors.accent,
    borderBottomWidth: 128,
    borderLeftColor: "transparent",
    borderLeftWidth: 20,
    borderRightColor: "transparent",
    borderRightWidth: 20,
    height: 0,
    width: 0,
  },
  qiblaDegrees: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  qiblaReadout: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  qiblaReadoutItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    padding: spacing.md,
  },
  qiblaReadoutLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "800",
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  qiblaReadoutValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  infoBand: {
    alignSelf: "stretch",
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.xl,
    padding: spacing.lg,
  },
  infoBandTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
    marginBottom: spacing.xs,
  },
  infoBandText: {
    color: colors.mutedText,
    fontSize: typography.body,
    lineHeight: 22,
  },
  settingsGroup: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  locationPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  locationPanelHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  locationPanelTextGroup: {
    flex: 1,
    paddingRight: spacing.md,
  },
  locationTimeZone: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  testLocationList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  testLocationButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  testLocationButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  testLocationLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  testLocationLabelActive: {
    color: colors.onAccent,
  },
  testLocationCoordinates: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
  },
  testLocationCoordinatesActive: {
    color: colors.onAccentMuted,
  },
  settingRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.md,
    minHeight: 76,
    padding: spacing.lg,
  },
  settingLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  settingDescription: {
    color: colors.mutedText,
    fontSize: typography.small,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  settingValue: {
    color: colors.accentDeep,
    fontSize: typography.body,
    fontWeight: "800",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  choiceButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: spacing.md,
  },
  choiceButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  choiceButtonText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "800",
  },
  choiceButtonTextActive: {
    color: colors.onAccent,
  },
  offsetList: {
    gap: spacing.sm,
  },
  offsetRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  offsetLabel: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "700",
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  inlineStepperGroup: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  inlineStepperLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
  },
  notificationStatus: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
    lineHeight: 18,
  },
  testNotificationButton: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  testNotificationButtonText: {
    color: colors.accentDeep,
    fontSize: typography.body,
    fontWeight: "800",
  },
  stepper: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  stepperButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  stepperButtonText: {
    color: colors.accentDeep,
    fontSize: typography.body,
    fontWeight: "800",
  },
  stepperValue: {
    color: colors.accentDeep,
    fontSize: typography.small,
    fontWeight: "800",
    minWidth: 56,
    textAlign: "center",
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.sm,
  },
  tabButton: {
    alignItems: "center",
    borderRadius: radii.md,
    flex: 1,
    gap: spacing.xs,
    minHeight: 62,
    paddingVertical: spacing.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.accentSoft,
  },
  tabSymbol: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  tabSymbolActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabSymbolText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "800",
  },
  tabSymbolTextActive: {
    color: colors.onAccent,
  },
  tabLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: colors.accentDeep,
  },
});
