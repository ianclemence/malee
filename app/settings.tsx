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

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const BG = "#FFFFFF";

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
          <View style={styles.iconButton} />
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
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.level}>English Level: Advanced</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.words}</Text>
            <Text style={styles.statLabel}>Words</Text>
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
          <Text style={styles.sectionHeader}>Activity</Text>
          <View style={styles.heatmapContainer}>
            {heatmapDays.map((date) => {
              const count = heatmap[date] || 0;
              const opacity = count === 0 ? 0.1 : Math.min(1, 0.2 + count * 0.1);
              return (
                <View
                  key={date}
                  style={[
                    styles.heatmapSquare,
                    { backgroundColor: count > 0 ? ACCENT : "#E0E0E0", opacity: count > 0 ? 1 : 0.3 }
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Badges</Text>
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
          <Text style={styles.sectionHeader}>Study Settings</Text>
          <View style={styles.card}>
            {/* Daily Goal */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="flag" size={20} color={TEXT} />
              </View>
              <Text style={styles.rowLabel}>Daily Goal</Text>
              <View style={styles.toggles}>
                {[10, 20, 50].map(val => (
                  <Pressable
                    key={val}
                    style={[styles.toggleBtn, settings.dailyGoal === val && styles.toggleBtnActive]}
                    onPress={() => updateSetting('dailyGoal', val)}
                  >
                    <Text style={[styles.toggleText, settings.dailyGoal === val && styles.toggleTextActive]}>{val}</Text>
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
          <Text style={styles.sectionHeader}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="notifications" size={20} color={TEXT} />
              </View>
              <Text style={styles.rowLabel}>Daily Reminders</Text>
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
              <Text style={styles.rowLabel}>Sound Effects</Text>
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
          <Text style={styles.sectionHeader}>Subscription</Text>
          <View style={styles.card}>
            <Pressable style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="workspace-premium" size={20} color={TEXT} />
              </View>
              <Text style={styles.rowLabel}>Current Plan</Text>
              <Text style={styles.rowValue}>Pro</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <Text style={styles.versionText}>Version 1.0.0</Text>
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
    justifyContent: "space-between",
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
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: TEXT,
    marginBottom: 16,
    position: "relative",
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
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },
  level: {
    fontSize: 16,
    color: TEXT,
    opacity: 0.6,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: TEXT,
    opacity: 0.6,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT,
    backgroundColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 60,
  },
  logoutBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FF4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoutText: {
    color: "#FF4444",
    fontWeight: "700",
    fontSize: 18,
  },
  versionText: {
    textAlign: "center",
    color: TEXT,
    opacity: 0.3,
    fontSize: 14,
    fontWeight: "600",
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
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 12,
  },
  badgeLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },
  toggles: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  toggleBtnActive: {
    backgroundColor: TEXT,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },
  toggleTextActive: {
    color: ACCENT,
  },
});
