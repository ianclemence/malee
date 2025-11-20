import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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
const ALERT = "#FF6A3D";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Settings</Text>
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
            <Text style={styles.statValue}>32</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>4h</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak</Text>
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
                value={true}
                trackColor={{ false: "#E0E0E0", true: ACCENT }}
                thumbColor={TEXT}
              />
            </View>
            <View style={styles.divider} />
            <Pressable style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialIcons name="volume-up" size={20} color={TEXT} />
              </View>
              <Text style={styles.rowLabel}>Sound Effects</Text>
              <MaterialIcons name="chevron-right" size={24} color={TEXT} style={{ opacity: 0.3 }} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.card}>
            <Pressable style={styles.row}>
              <Text style={styles.rowLabel}>Personal Data</Text>
              <MaterialIcons name="chevron-right" size={24} color={TEXT} style={{ opacity: 0.3 }} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.row}>
              <Text style={styles.rowLabel}>Subscription</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
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
});
