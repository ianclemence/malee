import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const BG = "#FFFFFF";
const BLUE_BG = "#C9D9FF";
const GREEN_BG = "#E8F4C8";
const BEIGE_BG = "#EDE6D6";

export default function DecksScreen() {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [cardLikes, setCardLikes] = useState<{ [key: string]: boolean }>({
    aviation: false,
    airport: false,
  });
  const [view, setView] = useState<"all" | "my" | "favorites">("all");
  const [query, setQuery] = useState("");

  const decks = [
    {
      slug: "aviation",
      title: "Aviation",
      count: 40,
      icon: "flight-takeoff",
      bg: GREEN_BG,
      owned: true,
    },
    {
      slug: "airport",
      title: "At the airport",
      count: 46,
      icon: "flight",
      bg: BEIGE_BG,
      owned: false,
    },
  ];

  const visibleDecks = decks
    .filter((d) => {
      if (view === "favorites") return !!cardLikes[d.slug];
      if (view === "my") return d.owned;
      return true;
    })
    .filter((d) =>
      d.title.toLowerCase().includes(query.trim().toLowerCase())
    );

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

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={TEXT} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search decks"
          placeholderTextColor="#00000066"
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} style={styles.searchClearBtn}>
            <MaterialIcons name="close" size={18} color={TEXT} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.featureedTabsContainer}>
        <View style={styles.segmentRow}>
          <Pressable
            style={[
              styles.segmentBtn,
              view === "all" && styles.segmentBtnActive,
            ]}
            onPress={() => setView("all")}
          >
            <Text
              style={[
                styles.segmentText,
                view === "all" && styles.segmentTextActive,
              ]}
            >
              All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentBtn,
              view === "my" && styles.segmentBtnActive,
            ]}
            onPress={() => setView("my")}
          >
            <Text
              style={[
                styles.segmentText,
                view === "my" && styles.segmentTextActive,
              ]}
            >
              My Decks
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segmentBtn,
              view === "favorites" && styles.segmentBtnActive,
            ]}
            onPress={() => setView("favorites")}
          >
            <Text
              style={[
                styles.segmentText,
                view === "favorites" && styles.segmentTextActive,
              ]}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.grid}>
        {visibleDecks.map((d) => (
          <Pressable
            key={d.slug}
            style={[styles.card, { backgroundColor: d.bg }]}
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
                onPress={() =>
                  setCardLikes((p) => ({ ...p, [d.slug]: !p[d.slug] }))
                }
              >
                <MaterialIcons
                  name={cardLikes[d.slug] ? "favorite" : "favorite-border"}
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
  featuredLarge: {
    backgroundColor: BLUE_BG,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
    padding: 16,
    minHeight: 280,
  },
  featureedTabsContainer: {
    marginBottom: 12,
  },
  segmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: ACCENT,
  },
  segmentText: {
    color: TEXT,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: TEXT,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 40,
    borderRadius: 20,
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: TEXT,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 16,
    fontWeight: "600",
  },
  searchClearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureRow: {
    position: "absolute",
    left: 16,
    right: 72,
    bottom: 16,
    alignItems: "flex-start",
  },
  largeImage: {
    width: "100%",
    height: 200,
  },
  largeTitle: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 18,
  },
  largeCount: {
    color: TEXT,
    fontWeight: "700",
  },
  favoriteBtn: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEXT,
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    height: 160,
    borderRadius: 16,
    alignItems: "stretch",
    justifyContent: "space-between",
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
    alignItems: "flex-start",
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
