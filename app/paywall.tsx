import { ThemedText } from "@/components/themed-text";
import { Palette, Radii, Shadows, Strokes, FontSizes } from "@/constants/theme";
import { usePurchases } from "@/lib/purchases";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;

const FEATURES = [
  { icon: "mic", title: "Unlimited Pronunciation", desc: "Get feedback on every word" },
  { icon: "layers", title: "Unlimited Decks", desc: "Create as many custom decks as you want" },
  { icon: "bar-chart", title: "Advanced Stats", desc: "Track your progress with detailed analytics" },
  { icon: "bookmark", title: "Priority Support", desc: "Get help when you need it" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const { packages, loading, purchasePackage, restorePurchases } = usePurchases();

  const monthly = packages.find((p) => p.product.identifier === "malee_pro_monthly");
  const annual = packages.find((p) => p.product.identifier === "malee_pro_annual");
  const displayAnnual = annual || monthly;

  async function handlePurchase(pkg: typeof monthly) {
    if (!pkg) return;
    const success = await purchasePackage(pkg);
    if (success) {
      router.back();
    }
  }

  async function handleRestore() {
    const success = await restorePurchases();
    if (success) {
      router.back();
    }
  }

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={TEXT} />
        </Pressable>

        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="diamond" size={48} color={TEXT} />
          </View>
          <ThemedText type="title" style={styles.title}>Upgrade to Pro</ThemedText>
          <ThemedText style={styles.subtitle}>Unlock the full Malee experience</ThemedText>
        </View>

        <View style={styles.featuresSection}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon as any} size={20} color={TEXT} />
              </View>
              <View style={styles.featureText}>
                <ThemedText style={styles.featureTitle}>{f.title}</ThemedText>
                <ThemedText style={styles.featureDesc}>{f.desc}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.pricingSection}>
          {loading ? (
            <ActivityIndicator size="large" color={TEXT} />
          ) : (
            <>
              {annual && (
                <Pressable
                  style={styles.priceCard}
                  onPress={() => handlePurchase(annual)}
                >
                  <View style={styles.priceTag}>
                    <Text style={styles.priceValue}>{annual.product.priceString}</Text>
                  </View>
                  <ThemedText style={styles.priceLabel}>per year</ThemedText>
                  <ThemedText style={styles.priceSub}>Save 50% vs monthly</ThemedText>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                  </View>
                </Pressable>
              )}

              {monthly && (
                <Pressable
                  style={styles.priceCard}
                  onPress={() => handlePurchase(monthly)}
                >
                  <View style={styles.priceTag}>
                    <Text style={styles.priceValue}>{monthly.product.priceString}</Text>
                  </View>
                  <ThemedText style={styles.priceLabel}>per month</ThemedText>
                </Pressable>
              )}

              {!annual && !monthly && (
                <Pressable
                  style={styles.priceCard}
                  onPress={() => handlePurchase(packages[0])}
                >
                  <View style={styles.priceTag}>
                    <Text style={styles.priceValue}>{packages[0]?.product.priceString || "$4.99"}</Text>
                  </View>
                  <ThemedText style={styles.priceLabel}>one-time</ThemedText>
                </Pressable>
              )}
            </>
          )}
        </View>

        <Pressable style={styles.restoreBtn} onPress={handleRestore}>
          <ThemedText style={styles.restoreText}>Restore Purchases</ThemedText>
        </Pressable>

        <ThemedText style={styles.legalText}>
          Cancel anytime. Subscription automatically renews unless auto-renew is turned off.
        </ThemedText>
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
    paddingBottom: 40,
    paddingTop: 48,
  },
  closeBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    zIndex: 10,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ACCENT,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: FontSizes.h1,
    color: TEXT,
    marginBottom: 8,
    fontFamily: "Outfit_700Bold",
    lineHeight: 48,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Outfit_500Medium",
  },
  featuresSection: {
    gap: 12,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.white,
    padding: 16,
    borderRadius: Radii.card,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSizes.body,
    color: TEXT,
    fontFamily: "Outfit_700Bold",
  },
  featureDesc: {
    fontSize: FontSizes.small,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Outfit_500Medium",
    marginTop: 2,
  },
  pricingSection: {
    gap: 12,
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: Palette.white,
    padding: 20,
    borderRadius: Radii.card,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    alignItems: "center",
    ...Shadows.brutalist,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 48,
    color: TEXT,
    fontFamily: "Outfit_700Bold",
    lineHeight: 52,
  },
  priceLabel: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Outfit_500Medium",
  },
  priceSub: {
    fontSize: FontSizes.small,
    color: Palette.success,
    fontFamily: "Outfit_700Bold",
    marginTop: 4,
  },
  bestValueBadge: {
    position: "absolute",
    top: -12,
    right: 16,
    backgroundColor: ACCENT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.button,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
  },
  bestValueText: {
    fontSize: 10,
    color: TEXT,
    fontFamily: "Outfit_700Bold",
  },
  restoreBtn: {
    alignItems: "center",
    padding: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: "Outfit_500Medium",
    textDecorationLine: "underline",
  },
  legalText: {
    fontSize: 12,
    color: TEXT,
    opacity: 0.4,
    textAlign: "center",
    lineHeight: 16,
    fontFamily: "Outfit_400Regular",
  },
});
