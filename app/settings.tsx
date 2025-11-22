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
  getUserLevel,
  resetProgress,
  saveSettings,
} from "@/lib/storage";
import { FluentMeService } from "@/services/fluent-me";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
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

  const runDiagnostics = async () => {
    Alert.alert("Running Diagnostics", "Please wait...");
    const result = await FluentMeService.runDiagnostics();
    Alert.alert("Diagnostics Result", result);
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeaderBar rightIconName="close" onRightPress={() => router.back()} />

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Pressable onPress={pickImage}>
              {settings.avatarUri ? (
                <Image
                  source={{ uri: settings.avatarUri }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: "#E0E0E0", alignItems: "center", justifyContent: "center" }]}>
                  <MaterialIcons name="person" size={64} color="#757575" />
                </View>
              )}
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
          <ThemedText style={styles.level}>English Level: {getUserLevel(stats.words)}</ThemedText>
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

        {/* Preferences */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Preferences
          </ThemedText>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Daily Reminders</ThemedText>
            <Switch
              value={settings.dailyReminders}
              onValueChange={() => toggleSetting("dailyReminders")}
              trackColor={{ false: Palette.black, true: ACCENT }}
              thumbColor={Palette.white}
              ios_backgroundColor={Palette.black}
              style={{ borderRadius: 16, borderWidth: Strokes.thin, borderColor: Palette.black }}
            />
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Sound Effects</ThemedText>
            <Switch
              value={settings.soundEffects}
              onValueChange={() => toggleSetting("soundEffects")}
              trackColor={{ false: Palette.black, true: ACCENT }}
              thumbColor={Palette.white}
              ios_backgroundColor={Palette.black}
              style={{ borderRadius: 16, borderWidth: Strokes.thin, borderColor: Palette.black }}
            />
          </View>
          <View style={styles.settingRow}>
            <ThemedText style={styles.settingLabel}>Daily Goal</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Pressable
                onPress={() =>
                  updateSetting("dailyGoal", Math.max(10, settings.dailyGoal - 10))
                }
                style={styles.iconButton}
              >
                <MaterialIcons name="remove" size={20} color={TEXT} />
              </Pressable>
              <Text style={{ fontSize: 16, fontWeight: "600", color: TEXT, width: 30, textAlign: "center" }}>
                {settings.dailyGoal}
              </Text>
              <Pressable
                onPress={() =>
                  updateSetting("dailyGoal", Math.min(100, settings.dailyGoal + 10))
                }
                style={styles.iconButton}
              >
                <MaterialIcons name="add" size={20} color={TEXT} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Diagnostics */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Diagnostics
          </ThemedText>
          <Pressable onPress={runDiagnostics} style={styles.dangerButton}>
            <MaterialIcons name="bug-report" size={20} color={Palette.white} />
            <Text style={styles.dangerButtonText}>Run API Diagnostics</Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Danger Zone
          </ThemedText>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Reset Progress",
                "Are you sure you want to reset all progress? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      await resetProgress();
                      await loadData();
                    },
                  },
                ]
              );
            }}
            style={[styles.dangerButton, { backgroundColor: Palette.error }]}
          >
            <MaterialIcons name="delete-forever" size={20} color={Palette.white} />
            <Text style={styles.dangerButtonText}>Reset Progress</Text>
          </Pressable>
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
              <View style={styles.proPill}>
                <Text style={styles.proText}>Pro</Text>
              </View>
            </Pressable>
          </View>
        </View>

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
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Edit Name
            </ThemedText>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
              placeholder="Enter your name"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsEditingName(false)}
                style={[styles.modalButton, { backgroundColor: "#E0E0E0" }]}
              >
                <Text style={{ color: TEXT, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  await updateSetting("name", newName);
                  setIsEditingName(false);
                }}
                style={[styles.modalButton, { backgroundColor: ACCENT }]}
              >
                <Text style={{ color: Palette.white, fontWeight: "600" }}>Save</Text>
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
  },
  rowLabel: {
    flex: 1,
    fontSize: FontSizes.body,
    color: TEXT,
    fontFamily: "Inter_500Medium",
  },
  rowValue: {
    fontSize: FontSizes.body,
    color: ACCENT,
    fontFamily: "Inter_600SemiBold",
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
    paddingRight: 16,
    gap: 16,
  },
  badgeCard: {
    width: 100,
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 12,
    alignItems: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  badgeLocked: {
    opacity: 0.5,
    backgroundColor: "#F5F5F5",
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
  },
  badgeTitle: {
    fontSize: 12,
    textAlign: "center",
    color: TEXT,
    fontFamily: "Inter_500Medium",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.white,
    padding: 16,
    borderRadius: Radii.card,
    marginBottom: 12,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  settingLabel: {
    fontSize: FontSizes.body,
    color: TEXT,
    fontFamily: "Inter_500Medium",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ACCENT,
    padding: 16,
    borderRadius: Radii.card,
    gap: 8,
    ...Shadows.brutalist,
  },
  dangerButtonText: {
    color: Palette.white,
    fontSize: FontSizes.body,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  logoutBtn: {
    marginTop: 24,
    alignItems: "center",
    padding: 16,
  },
  logoutText: {
    color: Palette.error,
    fontSize: FontSizes.body,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 32,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 24,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  input: {
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    borderRadius: Radii.button,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: Radii.button,
    alignItems: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
  },
  proPill: {
    backgroundColor: Palette.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.button,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  proText: {
    color: Palette.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
});
