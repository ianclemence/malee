import { DEFAULT_DECKS } from "@/data/decks";
import { getFavorites, setFavorite } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = "#F1FF00";
const BG = "#FFFFFF";
const TEXT = "#000000";
const CARD_BG = "#EDE6D6";
const PURPLE_BG = "#D9D4F6";

export default function HomeScreen() {
  const progress = 11 / 50;
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    (async () => {
      const fav = await getFavorites();
      setFavorites(fav);
    })();
  }, []);

  const picked = useMemo(() => {
    const decks = DEFAULT_DECKS.map((d) => ({ ...d, count: d.words.length }));
    const shuffled = decks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: BG }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>MALEE</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <MaterialIcons name="settings" size={24} color={TEXT} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>Wow, 1 day in a row</Text>
        </View>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.heroImage}
        />
      </View>

      <View style={styles.goalRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.goalLabel}>Today's goal</Text>
          <View style={styles.goalCountRow}>
            <MaterialIcons name="style" size={20} color={TEXT} />
            <Text style={styles.goalCount}>11 / 50</Text>
          </View>
        </View>
        <Pressable style={styles.goButton}>
          <MaterialIcons name="play-arrow" size={18} color={TEXT} />
          <Text style={styles.goButtonText}>Let's go!</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%` },
          ]}
        />
      </View>

      <Text style={styles.featuredTitle}>Picked by Malee</Text>
      <View style={styles.featuredGrid}>
        {picked.map((d, i) => (
          <Pressable
            key={d.slug}
            style={
              i % 2 === 0 ? styles.featuredCardPurple : styles.featuredCardGray
            }
            onPress={() =>
              router.push({
                pathname: "/deck/[slug]",
                params: {
                  slug: d.slug,
                  title: d.title,
                  count: String(d.count),
                },
              })
            }
          >
            <View style={styles.cardContent}>
              <MaterialIcons
                name={d.icon as any}
                size={48}
                color={TEXT}
                style={{ alignSelf: "flex-start" }}
              />
            </View>
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLeft}>
                <Text style={styles.deckLabel}>{d.title}</Text>
                <View style={styles.cardCountRow}>
                  <MaterialIcons name="style" size={18} color={TEXT} />
                  <Text style={styles.cardCountText}>{d.count}</Text>
                </View>
              </View>
              <Pressable
                style={styles.cardLikeBtn}
                onPress={async () => {
                  const next = !favorites[d.slug];
                  setFavorites((p) => ({ ...p, [d.slug]: next }));
                  await setFavorite(d.slug, next);
                }}
              >
                <MaterialIcons
                  name={favorites[d.slug] ? "favorite" : "favorite-border"}
                  size={18}
                  color={ACCENT}
                />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    marginTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT,
  },
  hero: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    minHeight: 280,
    overflow: "hidden",
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: TEXT,
    shadowColor: TEXT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
  },
  bubbleText: {
    color: TEXT,
    fontWeight: "700",
  },
  heroImage: {
    width: 200,
    height: 200,
    position: "absolute",
    right: 16,
    bottom: 16,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 18,
    color: TEXT,
    opacity: 0.8,
  },
  goalCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  goalCount: {
    fontSize: 18,
    color: TEXT,
    fontWeight: "700",
  },
  goButton: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 2,
    borderColor: TEXT,
  },
  goButtonText: {
    color: TEXT,
    fontWeight: "700",
  },
  progressTrack: {
    height: 12,
    backgroundColor: TEXT,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: TEXT,
  },
  progressFill: {
    height: "100%",
    backgroundColor: ACCENT,
  },
  featuredTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT,
  },
  featuredGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  featuredCardPurple: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    backgroundColor: PURPLE_BG,
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: 12,
    marginBottom: 12,
    position: "relative",
  },
  featuredCardGray: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    backgroundColor: "#EFEFEF",
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: 12,
    marginBottom: 12,
    position: "relative",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  deckLabel: {
    color: TEXT,
    fontWeight: "700",
    textAlign: "left",
    fontSize: 16,
  },
  cardFooter: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cardFooterLeft: {
    alignItems: "flex-start",
  },
  cardCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  cardCountText: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 14,
  },
  cardLikeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: TEXT,
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
});
