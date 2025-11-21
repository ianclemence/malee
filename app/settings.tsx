import { ThemedText } from "@/components/themed-text";
import { HeaderBar } from "@/components/ui/header-bar";
import { FontSizes, Palette, Radii, Shadows, Strokes } from "@/constants/theme";
import { DEFAULT_DECKS } from "@/data/decks";
import { useBottomSheet } from "@/hooks/bottom-sheet-store";
import {
  cancelAllNotifications,
  scheduleDailyReminder,
} from "@/lib/notifications";
import {
  AppSettings,
  getCustomDecks,
  getHeatmapData,
  getSettings,
  getStreak,
  getTotalLearned,
  getTotalTime,
  resetProgress,
  saveSettings,
} from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;

const BADGES = [
  {
    id: "streak_3",
    icon: "local-fire-department",
    title: "3 Day Streak",
    condition: (s: any) => s.streak >= 3,
  },
  {
    id: "words_10",
    icon: "school",
    title: "10 Words",
    condition: (s: any) => s.words >= 10,
  },
  {
    id: "words_50",
    icon: "verified",
    title: "50 Words",
    condition: (s: any) => s.words >= 50,
  },
  {
    id: "early_bird",
    icon: "wb-sunny",
    title: "Early Bird",
    condition: () => true,
  }, // Mocked for now
];

export default function SettingsScreen() {
  const router = useRouter();
  const bottomSheet = useBottomSheet();
  const [stats, setStats] = useState({ words: 0, time: "4h", streak: 0 });
  const [settings, setSettings] = useState<AppSettings>({
    dailyReminders: true,
    soundEffects: true,
    dailyGoal: 50,
    textSize: 1,
    name: "Guest User",
    avatarUri: null,
  });
  const [heatmap, setHeatmap] = useState<{ [date: string]: number }>({});
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    setNewName(settings.name);
  }, [settings.name]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await getSettings();
    setSettings(s);

    const streak = await getStreak();
    const customDecks = await getCustomDecks();
    const allSlugs = [
      ...DEFAULT_DECKS.map((d) => d.slug),
      ...customDecks.map((d) => d.slug),
    ];
    const learned = await getTotalLearned(allSlugs);
    const totalSeconds = await getTotalTime();
    const hm = await getHeatmapData();

    // Format time
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    setStats({ words: learned, time: timeStr, streak });
    setHeatmap(hm);
  };

  const toggleSetting = async (key: keyof AppSettings) => {
    const nextValue = !settings[key];
    const next = { ...settings, [key]: nextValue };
    setSettings(next);
    await saveSettings(next);

    if (key === "dailyReminders") {
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      await updateSetting("avatarUri", result.assets[0].uri);
    }
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderBar rightIconName="close" onRightPress={() => router.back()} />

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Pressable onPress={pickImage}>
              <Image
                source={
                  settings.avatarUri
                    ? { uri: settings.avatarUri }
                    : require("@/assets/images/react-logo.png")
                }
                style={styles.avatar}
              />
              <View style={styles.editBadge}>
                <MaterialIcons name="edit" size={14} color={TEXT} />
              </View>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              setNewName(settings.name);
              setIsEditingName(true);
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <ThemedText type="title" style={styles.name}>
              {settings.name}
            </ThemedText>
            <MaterialIcons name="edit" size={16} color={TEXT} style={{ opacity: 0.5 }} />
          </Pressable>
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
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Activity
          </ThemedText>
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
                      ? {
                        backgroundColor: ACCENT,
                        borderWidth: Strokes.thin,
                        borderColor: Palette.black,
                      }
                      : {
                        backgroundColor: Palette.white,
                        borderWidth: Strokes.thin,
                        borderColor: Palette.black,
                        opacity: 0.5,
                        ...Shadows.brutalist,
                      },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Badges */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Badges
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesRow}
          >
            {BADGES.map((badge) => {
              const unlocked = badge.condition(stats);
              return (
                <View
                  key={badge.id}
                  style={[styles.badgeCard, !unlocked && styles.badgeLocked]}
                >
                  <View
                    style={[
                      styles.badgeIcon,
                      unlocked && { backgroundColor: ACCENT },
                    ]}
                  >
                    <MaterialIcons
                      name={badge.icon as any}
                      size={24}
                      color={TEXT}
                    />
                  </View>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Study Settings
          </ThemedText>
          <View style={styles.card}>
            {/* Daily Goal */}
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="flag" size={20} color={TEXT} />
              </View>
              <ThemedText style={styles.rowLabel}>Daily Goal</ThemedText>
              <View style={styles.toggles}>
                {[10, 20, 50].map((val) => (
                  <Pressable
                    key={val}
                    style={[
                      styles.toggleBtn,
                      settings.dailyGoal === val && styles.toggleBtnActive,
                    ]}
                    onPress={() => updateSetting("dailyGoal", val)}
                  >
                    <ThemedText
                      style={[
                        styles.toggleText,
                        settings.dailyGoal === val && styles.toggleTextActive,
                      ]}
                    >
                      {val}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.divider} />

            {/* Daily Reminders */}
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

            {/* Sound Effects */}
            <Pressable
              style={styles.row}
              onPress={() => toggleSetting("soundEffects")}
            >
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
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Subscription
          </ThemedText>
          <View style={styles.card}>
            <Pressable style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons
                  name="workspace-premium"
                  size={20}
                  color={TEXT}
                />
              </View>
              <ThemedText style={styles.rowLabel}>Current Plan</ThemedText>
              <ThemedText style={styles.rowValue}>Pro</ThemedText>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={async () => {
            bottomSheet.hide();
            await resetProgress();
            // Reload data to reflect changes (or just go back/reset state)
            setStats({ words: 0, time: "0h", streak: 0 });
            setHeatmap({});
            // Optional: Navigate to a welcome screen or just show empty state
            router.replace("/(tabs)");
          }}
        >
          <ThemedText style={styles.logoutText}>Reset Progress</ThemedText>
        </Pressable>

        <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        visible={isEditingName}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingName(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Edit Name
            </ThemedText>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setIsEditingName(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={() => {
                  updateSetting("name", newName);
                  setIsEditingName(false);
                }}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    fontFamily: "PlayfairDisplay_500Medium",
  },
  level: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Inter_500Medium",
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
    fontFamily: "PlayfairDisplay_500Medium",
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Inter_500Medium",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: TEXT,
    marginBottom: 16,
    fontFamily: "PlayfairDisplay_600SemiBold",
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
    fontFamily: "Inter_700Bold",
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
    alignSelf: "stretch",
    marginLeft: 0,
  },
  logoutBtn: {
    height: 56,
    borderRadius: Radii.button,
    borderWidth: Strokes.regular,
    borderColor: Palette.error,
    backgroundColor: Palette.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    ...Shadows.brutalist,
  },
  logoutText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: FontSizes.button,
  },
  versionText: {
    textAlign: "center",
    color: TEXT,
    opacity: 0.3,
    fontSize: FontSizes.small,
    fontFamily: "Inter_500Medium",
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
    fontFamily: "Inter_700Bold",
  },
  toggles: {
    flexDirection: "row",
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.button,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
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
    fontFamily: "Inter_700Bold",
  },
  toggleTextActive: {
    color: ACCENT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 24,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    borderRadius: Radii.button,
    paddingHorizontal: 16,
    fontSize: FontSizes.body,
    fontFamily: "Inter_500Medium",
    marginBottom: 24,
    backgroundColor: "#F5F5F5",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: Radii.button,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  cancelBtn: {
    backgroundColor: Palette.white,
  },
  saveBtn: {
    backgroundColor: ACCENT,
  },
  cancelBtnText: {
    fontFamily: "Inter_700Bold",
    color: TEXT,
  },
  saveBtnText: {
    fontFamily: "Inter_700Bold",
    color: TEXT,
  },
});
