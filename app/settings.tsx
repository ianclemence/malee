import { DEFAULT_DECKS } from "@/data/decks";
import { cancelAllNotifications, scheduleDailyReminder } from "@/lib/notifications";
import { AppSettings, getCustomDecks, getHeatmapData, getSettings, getStreak, getTotalLearned, saveSettings } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Palette, Radii, Strokes, Shadows, FontSizes } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;

const BADGES = [
  { id: 'streak_3', icon: 'local-fire-department', title: '3 Day Streak', condition: (s: any) => s.streak >= 3 },
  { id: 'words_10', icon: 'school', title: '10 Words', condition: (s: any) => s.words >= 10 },
  { id: 'words_50', icon: 'verified', title: '50 Words', condition: (s: any) => s.words >= 50 },
  { id: 'early_bird', icon: 'wb-sunny', title: 'Early Bird', condition: () => true }, // Mocked for now
];

export default function SettingsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({ words: 0, time: "4h", streak: 0 });
  const [settings, setSettings] = useState<AppSettings>({ dailyReminders: true, soundEffects: true, dailyGoal: 50, textSize: 1 });
  const [heatmap, setHeatmap] = useState<{ [date: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await getSettings();
    setSettings(s);

    const streak = await getStreak();
    const customDecks = await getCustomDecks();
    const allSlugs = [...DEFAULT_DECKS.map((d) => d.slug), ...customDecks.map((d) => d.slug)];
    const learned = await getTotalLearned(allSlugs);
    const hm = await getHeatmapData();

    setStats({ words: learned, time: "4h", streak });
    setHeatmap(hm);
  };

  const toggleSetting = async (key: keyof AppSettings) => {
    const nextValue = !settings[key];
    const next = { ...settings, [key]: nextValue };
    setSettings(next);
    await saveSettings(next);

    if (key === 'dailyReminders') {
      if (nextValue) {
        await scheduleDailyReminder();
      } else {
        await cancelAllNotifications();
      }
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await saveSettings(next);
  };

  // Generate last 60 days for heatmap
  const heatmapDays = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <MaterialIcons name="edit" size={14} color={TEXT} />
            </View>
          </View>
          <ThemedText type="title" style={styles.name}>John Doe</ThemedText>
          <ThemedText style={styles.level}>English Level: Advanced</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>{stats.words}</ThemedText>
            <ThemedText style={styles.statLabel}>Words</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.time}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Heatmap */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Activity</ThemedText>
          <View style={styles.heatmapContainer}>
            {heatmapDays.map((date) => {
              const count = heatmap[date] || 0;
              const isActive = count > 0;
              return (
                <View
                  key={date}
                  style={[
                    styles.heatmapSquare,
                    isActive
                      ? { backgroundColor: ACCENT, borderWidth: Strokes.thin, borderColor: Palette.black }
                      : { backgroundColor: Palette.white, borderWidth: Strokes.thin, borderColor: Palette.black, opacity: 0.5, ...Shadows.brutalist }
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Badges</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {BADGES.map((badge) => {
              const unlocked = badge.condition(stats);
              return (
                <View key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeLocked]}>
                  <View style={[styles.badgeIcon, unlocked && { backgroundColor: ACCENT }]}>
                    <MaterialIcons name={badge.icon as any} size={24} color={TEXT} />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Study Settings</ThemedText>
          <View style={styles.card}>
            {/* Daily Goal */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="flag" size={20} color={TEXT} />
              </View>
              <ThemedText style={styles.rowLabel}>Daily Goal</ThemedText>
              <View style={styles.toggles}>
                {[10, 20, 50].map(val => (
                  <Pressable
                    key={val}
                    style={[styles.toggleBtn, settings.dailyGoal === val && styles.toggleBtnActive]}
                    onPress={() => updateSetting('dailyGoal', val)}
                  >
                    <ThemedText style={[styles.toggleText, settings.dailyGoal === val && styles.toggleTextActive]}>{val}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.divider} />

            {/* Text Size */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="format-size" size={20} color={TEXT} />
              </View>
              <Text style={styles.rowLabel}>Text Size</Text>
              <View style={styles.toggles}>
                <Pressable
                  style={[styles.toggleBtn, settings.textSize === 0.8 && styles.toggleBtnActive]}
                  onPress={() => updateSetting('textSize', 0.8)}
                >
                  <Text style={[styles.toggleText, { fontSize: 12 }, settings.textSize === 0.8 && styles.toggleTextActive]}>A</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, settings.textSize === 1 && styles.toggleBtnActive]}
                  onPress={() => updateSetting('textSize', 1)}
                >
                  <Text style={[styles.toggleText, { fontSize: 16 }, settings.textSize === 1 && styles.toggleTextActive]}>A</Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, settings.textSize === 1.2 && styles.toggleBtnActive]}
                  onPress={() => updateSetting('textSize', 1.2)}
                >
                  <Text style={[styles.toggleText, { fontSize: 20 }, settings.textSize === 1.2 && styles.toggleTextActive]}>A</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Preferences</ThemedText>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="notifications" size={20} color={TEXT} />
              </View>
              <ThemedText style={styles.rowLabel}>Daily Reminders</ThemedText>
              <Switch
                value={settings.dailyReminders}
                onValueChange={() => toggleSetting("dailyReminders")}
                trackColor={{ false: "#E0E0E0", true: ACCENT }}
                thumbColor={TEXT}
              />
            </View>
            <View style={styles.divider} />
            <Pressable style={styles.row} onPress={() => toggleSetting("soundEffects")}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="volume-up" size={20} color={TEXT} />
              </View>
              <ThemedText style={styles.rowLabel}>Sound Effects</ThemedText>
              <Switch
                value={settings.soundEffects}
                onValueChange={() => toggleSetting("soundEffects")}
                trackColor={{ false: "#E0E0E0", true: ACCENT }}
                thumbColor={TEXT}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>Subscription</ThemedText>
          <View style={styles.card}>
            <Pressable style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="workspace-premium" size={20} color={TEXT} />
              </View>
              <ThemedText style={styles.rowLabel}>Current Plan</ThemedText>
              <ThemedText style={styles.rowValue}>Pro</ThemedText>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.logoutBtn}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </Pressable>

        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: TEXT,
    letterSpacing: -1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.white,
    borderRadius: 20,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    marginBottom: 16,
    position: "relative",
    ...Shadows.brutalist,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 47,
  },
  editBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: FontSizes.phrase,
    color: TEXT,
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay_500Medium',
  },
  level: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: 'Inter_500Medium',
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 16,
    alignItems: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  statValue: {
    fontSize: FontSizes.phrase,
    color: TEXT,
    marginBottom: 4,
    fontFamily: 'PlayfairDisplay_500Medium',
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: TEXT,
    opacity: 0.6,
    fontFamily: 'Inter_500Medium',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    color: TEXT,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    overflow: "hidden",
    ...Shadows.brutalist,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  rowIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSizes.body,
    color: TEXT,
    fontFamily: 'Inter_700Bold',
  },
  rowValue: {
    fontSize: FontSizes.body,
    color: ACCENT,
    backgroundColor: Palette.black,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.button,
    overflow: "hidden",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  divider: {
    height: Strokes.thin,
    backgroundColor: Palette.black,
    marginLeft: 60,
  },
  logoutBtn: {
    height: 56,
    borderRadius: Radii.button,
    borderWidth: Strokes.regular,
    borderColor: Palette.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...Shadows.brutalist,
  },
  logoutText: {
    color: Palette.error,
    fontFamily: 'Inter_700Bold',
    fontSize: FontSizes.button,
  },
  versionText: {
    textAlign: "center",
    color: TEXT,
    opacity: 0.3,
    fontSize: FontSizes.small,
    fontFamily: 'Inter_500Medium',
  },
  heatmapContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  heatmapSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  badgesRow: {
    gap: 12,
    paddingRight: 16,
  },
  badgeCard: {
    width: 100,
    height: 120,
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 12,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  badgeTitle: {
    fontSize: FontSizes.small,
    color: TEXT,
    textAlign: "center",
    fontFamily: 'Inter_700Bold',
  },
  toggles: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.button,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  toggleBtnActive: {
    backgroundColor: TEXT,
  },
  toggleText: {
    fontSize: FontSizes.body,
    color: TEXT,
    fontFamily: 'Inter_700Bold',
  },
  toggleTextActive: {
    color: ACCENT,
  },
});
