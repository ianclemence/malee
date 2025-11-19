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
  Dimensions,
} from "react-native";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const BG = "#FFFFFF";
const ALERT = "#FF6A3D";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.page}>
      <View style={styles.accentBg} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>

          <View style={styles.avatarRow}>
            <View style={styles.avatarHolder}>
              <Image
                source={require("@/assets/images/react-logo.png")}
                style={styles.avatar}
              />
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={16} color={TEXT} />
              </View>
            </View>
          </View>

          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.level}>English level: ADVANCED</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>32</Text>
              <Text style={styles.metricLabel}>Vocabulary size</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>4 h 27 min</Text>
              <Text style={styles.metricLabel}>Study time</Text>
            </View>
          </View>

          <Text style={styles.subscription}>
            Subscription expires at 1 January 2026
          </Text>
        </View>

        <View style={styles.listSection}>
          <View style={styles.listItem}>
            <Text style={styles.listLabel}>Reminders</Text>
            <Switch
              value={true}
              trackColor={{ false: TEXT, true: TEXT }}
              thumbColor={BG}
            />
          </View>
          <View style={styles.separator} />
          <Pressable style={styles.listItem}>
            <Text style={styles.listLabel}>Personal data</Text>
            <MaterialIcons name="chevron-right" size={22} color={TEXT} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.listItem}>
            <Text style={styles.listLabel}>Privacy policy</Text>
            <MaterialIcons name="chevron-right" size={22} color={TEXT} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.listItem}>
            <Text style={styles.listLabel}>User agreement</Text>
            <MaterialIcons name="chevron-right" size={22} color={TEXT} />
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
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
    paddingBottom: 24,
    marginTop: 48,
  },
  headerCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    position: "relative",
  },
  accentBg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: Math.round(Dimensions.get("window").height * 0.4),
    backgroundColor: ACCENT,
  },
  closeBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarRow: {
    alignItems: "flex-start",
  },
  avatarHolder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: TEXT,
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  cameraBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
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
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
    marginTop: 12,
  },
  level: {
    marginTop: 4,
    color: TEXT,
    opacity: 0.9,
    fontSize: 18,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },
  metricItem: {
    alignItems: "flex-start",
  },
  metricValue: {
    fontSize: 30,
    fontWeight: "700",
    color: TEXT,
  },
  metricLabel: {
    color: TEXT,
    opacity: 0.8,
    fontSize: 18,
  },
  subscription: {
    marginTop: 16,
    color: TEXT,
    fontSize: 18,
  },
  listSection: {
    marginTop: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listLabel: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: TEXT,
    opacity: 0.1,
    marginHorizontal: 16,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  logoutText: {
    color: ALERT,
    fontWeight: "700",
    fontSize: 18,
  },
});
