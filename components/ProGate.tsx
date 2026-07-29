import { Palette, Radii, Shadows, Strokes, FontSizes } from "@/constants/theme";
import { usePurchases } from "@/lib/purchases";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ProGateProps = {
  feature: "pronunciation" | "decks" | "stats" | "badges";
  children: React.ReactNode;
};

const FEATURE_CONFIG = {
  pronunciation: {
    icon: "mic",
    title: "Pro Feature",
    desc: "Upgrade to Pro for AI pronunciation scoring",
  },
  decks: {
    icon: "layers",
    title: "Deck Limit Reached",
    desc: "Upgrade to Pro for unlimited custom decks",
  },
  stats: {
    icon: "bar-chart",
    title: "Pro Feature",
    desc: "Upgrade to Pro for advanced analytics",
  },
  badges: {
    icon: "ribbon",
    title: "Pro Feature",
    desc: "Upgrade to Pro to earn badges",
  },
};

export function ProGate({ feature, children }: ProGateProps) {
  const { isPro, loading } = usePurchases();
  const router = useRouter();

  if (loading) return null;

  if (isPro) return <>{children}</>;

  const config = FEATURE_CONFIG[feature];

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={config.icon as any} size={24} color={Palette.black} />
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.desc}>{config.desc}</Text>
      <Pressable
        style={styles.upgradeBtn}
        onPress={() => router.push("/paywall")}
      >
        <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.white,
    borderRadius: Radii.card,
    padding: 24,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    alignItems: "center",
    ...Shadows.brutalist,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.primary,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: FontSizes.body,
    color: Palette.black,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
  },
  desc: {
    fontSize: FontSizes.small,
    color: Palette.black,
    opacity: 0.6,
    fontFamily: "Outfit_500Medium",
    marginBottom: 16,
    textAlign: "center",
  },
  upgradeBtn: {
    backgroundColor: Palette.black,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radii.button,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  upgradeBtnText: {
    color: Palette.primary,
    fontFamily: "Outfit_700Bold",
    fontSize: FontSizes.body,
  },
});
