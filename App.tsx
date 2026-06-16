import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { mockPrayerTimes, settingsPreview } from './src/data/prayers';
import { colors, radii, spacing, typography } from './src/theme';
import type { PrayerName } from './src/types';

type TabKey = 'today' | 'qibla' | 'settings';

const tabs: Array<{ key: TabKey; label: string; symbol: string }> = [
  { key: 'today', label: 'Today', symbol: 'T' },
  { key: 'qibla', label: 'Qibla', symbol: 'Q' },
  { key: 'settings', label: 'Settings', symbol: 'S' },
];

const prayerLabels: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('today');

  const screen = useMemo(() => {
    if (activeTab === 'qibla') {
      return <QiblaScreen />;
    }

    if (activeTab === 'settings') {
      return <SettingsScreen />;
    }

    return <TodayScreen />;
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <View style={styles.content}>{screen}</View>
        <TabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function TodayScreen() {
  return (
    <ScrollView
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.location}>Copenhagen, Denmark</Text>
          <View style={styles.dateStack}>
            <Text style={styles.hijriDateText}>1 Muharram</Text>
            <Text style={styles.dateText}>Tuesday, June 16</Text>
          </View>
        </View>
      </View>

      <View style={styles.nextPrayerPanel}>
        <Text style={styles.eyebrow}>Next prayer</Text>
        <View style={styles.nextPrayerRow}>
          <View>
            <Text style={styles.nextPrayerName}>Asr</Text>
            <Text style={styles.countdown}>in 2h 14m</Text>
          </View>
          <Text style={styles.nextPrayerTime}>17:34</Text>
        </View>
      </View>

      <View style={styles.prayerList}>
        {mockPrayerTimes.map((prayer) => (
          <PrayerTimeRow
            key={prayer.name}
            name={prayerLabels[prayer.name]}
            time={prayer.time}
            isNext={prayer.name === 'asr'}
          />
        ))}
      </View>
    </ScrollView>
  );
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

function QiblaScreen() {
  return (
    <ScrollView
      contentContainerStyle={[styles.screenContent, styles.centeredScreen]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.qiblaHeader}>
        <Text style={styles.screenTitle}>Qibla</Text>
        <Text style={styles.screenSubtitle}>Keep the phone flat.</Text>
      </View>

      <View style={styles.compass}>
        <Text style={[styles.compassLabel, styles.compassNorth]}>N</Text>
        <Text style={[styles.compassLabel, styles.compassEast]}>E</Text>
        <Text style={[styles.compassLabel, styles.compassSouth]}>S</Text>
        <Text style={[styles.compassLabel, styles.compassWest]}>W</Text>
        <View style={styles.compassInner}>
          <View style={styles.qiblaArrow} />
          <Text style={styles.qiblaDegrees}>121 deg</Text>
        </View>
      </View>

      <View style={styles.infoBand}>
        <Text style={styles.infoBandTitle}>Sensor preview</Text>
        <Text style={styles.infoBandText}>
          Live compass movement will be connected in the Qibla phase after
          location and sensor permissions are in place.
        </Text>
      </View>
    </ScrollView>
  );
}

function SettingsScreen() {
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

      <View style={styles.settingsGroup}>
        {settingsPreview.map((setting) => (
          <View key={setting.label} style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>{setting.label}</Text>
              <Text style={styles.settingDescription}>
                {setting.description}
              </Text>
            </View>
            <Text style={styles.settingValue}>{setting.value}</Text>
          </View>
        ))}
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
            <View style={[styles.tabSymbol, isActive && styles.tabSymbolActive]}>
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
    alignItems: 'center',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  location: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
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
    fontWeight: '700',
    marginBottom: spacing.xs,
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
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  nextPrayerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  nextPrayerName: {
    color: colors.onAccent,
    fontSize: typography.display,
    fontWeight: '800',
  },
  countdown: {
    color: colors.onAccentMuted,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  nextPrayerTime: {
    color: colors.onAccent,
    fontSize: typography.heading,
    fontWeight: '800',
  },
  prayerList: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  prayerRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: spacing.lg,
  },
  prayerRowActive: {
    backgroundColor: colors.accentSoft,
  },
  prayerRowLabelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
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
    fontWeight: '600',
  },
  prayerNameActive: {
    color: colors.accentDeep,
  },
  prayerTime: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  prayerTimeActive: {
    color: colors.accentDeep,
  },
  qiblaHeader: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  screenTitle: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: colors.mutedText,
    fontSize: typography.body,
    marginTop: spacing.xs,
  },
  compass: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 160,
    borderWidth: 1,
    justifyContent: 'center',
    maxWidth: 320,
    position: 'relative',
    width: '100%',
  },
  compassInner: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 105,
    borderWidth: 1,
    height: 210,
    justifyContent: 'center',
    width: 210,
  },
  compassLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800',
    position: 'absolute',
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
    borderLeftColor: 'transparent',
    borderLeftWidth: 20,
    borderRightColor: 'transparent',
    borderRightWidth: 20,
    height: 0,
    transform: [{ rotate: '121deg' }],
    width: 0,
  },
  qiblaDegrees: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  infoBand: {
    alignSelf: 'stretch',
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
    fontWeight: '800',
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
    overflow: 'hidden',
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
    fontWeight: '700',
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
    fontWeight: '800',
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.sm,
  },
  tabButton: {
    alignItems: 'center',
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
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  tabSymbolActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabSymbolText: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '800',
  },
  tabSymbolTextActive: {
    color: colors.onAccent,
  },
  tabLabel: {
    color: colors.mutedText,
    fontSize: typography.small,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: colors.accentDeep,
  },
});
