import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

const ACCENT = "#F1FF00";
const BG = "#FFFFFF";
const TEXT = "#000000";
const CARD_BG = "#EDE6D6";
const PURPLE_BG = "#D9D4F6";

export default function HomeScreen() {
  const progress = 11 / 50;
  const router = useRouter();
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({
    airport: false,
    job: false,
    restaurant: false,
    clothing: false,
    aviation: false,
  });

  return (
    <ScrollView
      style={{ backgroundColor: BG }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>MALEE</Text>
        <MaterialIcons name="settings" size={24} color={TEXT} />
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

      <Text style={styles.featuredTitle}>Featured Decks</Text>
      <View style={styles.featuredGrid}>
        <Pressable
          style={styles.featuredCardPurple}
          onPress={() =>
            router.push({ pathname: "/deck/[slug]", params: { slug: "airport", title: "At the airport", count: "46" } })
          }
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="flight" size={48} color={TEXT} style={{ alignSelf: "flex-start" }} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterLeft}>
              <Text style={styles.deckLabel}>At the airport</Text>
              <View style={styles.cardCountRow}>
                <MaterialIcons name="style" size={18} color={TEXT} />
                <Text style={styles.cardCountText}>46</Text>
              </View>
            </View>
            <Pressable style={styles.cardLikeBtn} onPress={() => setLikes((p) => ({ ...p, airport: !p.airport }))}>
              <MaterialIcons name={likes.airport ? "favorite" : "favorite-border"} size={18} color={ACCENT} />
            </Pressable>
          </View>
        </Pressable>

        <Pressable
          style={styles.featuredCardGray}
          onPress={() =>
            router.push({ pathname: "/deck/[slug]", params: { slug: "job-interview", title: "Job interview", count: "32" } })
          }
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="work" size={48} color={TEXT} style={{ alignSelf: "flex-start" }} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterLeft}>
              <Text style={styles.deckLabel}>Job interview</Text>
              <View style={styles.cardCountRow}>
                <MaterialIcons name="style" size={18} color={TEXT} />
                <Text style={styles.cardCountText}>32</Text>
              </View>
            </View>
            <Pressable style={styles.cardLikeBtn} onPress={() => setLikes((p) => ({ ...p, job: !p.job }))}>
              <MaterialIcons name={likes.job ? "favorite" : "favorite-border"} size={18} color={ACCENT} />
            </Pressable>
          </View>
        </Pressable>

        <Pressable
          style={styles.featuredCardPurple}
          onPress={() =>
            router.push({ pathname: "/deck/[slug]", params: { slug: "restaurant", title: "Restaurant ordering", count: "28" } })
          }
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="restaurant" size={48} color={TEXT} style={{ alignSelf: "flex-start" }} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterLeft}>
              <Text style={styles.deckLabel}>Restaurant ordering</Text>
              <View style={styles.cardCountRow}>
                <MaterialIcons name="style" size={18} color={TEXT} />
                <Text style={styles.cardCountText}>28</Text>
              </View>
            </View>
            <Pressable style={styles.cardLikeBtn} onPress={() => setLikes((p) => ({ ...p, restaurant: !p.restaurant }))}>
              <MaterialIcons name={likes.restaurant ? "favorite" : "favorite-border"} size={18} color={ACCENT} />
            </Pressable>
          </View>
        </Pressable>

        <Pressable
          style={styles.featuredCardGray}
          onPress={() =>
            router.push({ pathname: "/deck/[slug]", params: { slug: "clothing", title: "Clothing", count: "46" } })
          }
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="checkroom" size={48} color={TEXT} style={{ alignSelf: "flex-start" }} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterLeft}>
              <Text style={styles.deckLabel}>Clothing</Text>
              <View style={styles.cardCountRow}>
                <MaterialIcons name="style" size={18} color={TEXT} />
                <Text style={styles.cardCountText}>46</Text>
              </View>
            </View>
            <Pressable style={styles.cardLikeBtn} onPress={() => setLikes((p) => ({ ...p, clothing: !p.clothing }))}>
              <MaterialIcons name={likes.clothing ? "favorite" : "favorite-border"} size={18} color={ACCENT} />
            </Pressable>
          </View>
        </Pressable>

        <Pressable
          style={styles.featuredCardPurple}
          onPress={() =>
            router.push({ pathname: "/deck/[slug]", params: { slug: "aviation", title: "Aviation", count: "40" } })
          }
        >
          <View style={styles.cardContent}>
            <MaterialIcons name="flight-takeoff" size={48} color={TEXT} style={{ alignSelf: "flex-start" }} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.cardFooterLeft}>
              <Text style={styles.deckLabel}>Aviation</Text>
              <View style={styles.cardCountRow}>
                <MaterialIcons name="style" size={18} color={TEXT} />
                <Text style={styles.cardCountText}>40</Text>
              </View>
            </View>
            <Pressable style={styles.cardLikeBtn} onPress={() => setLikes((p) => ({ ...p, aviation: !p.aviation }))}>
              <MaterialIcons name={likes.aviation ? "favorite" : "favorite-border"} size={18} color={ACCENT} />
            </Pressable>
          </View>
        </Pressable>
      </View>

      <View style={styles.bottomSheet}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <MaterialIcons name="list-alt" size={20} color={TEXT} />
          <Text style={styles.sheetTitle}>Interview preparation</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <MaterialIcons name="style" size={18} color={TEXT} />
            <Text style={styles.sheetCount}>28</Text>
          </View>
          <Pressable style={styles.sheetPlay}>
            <MaterialIcons name="play-arrow" size={20} color={TEXT} />
          </Pressable>
          <MaterialIcons name="close" size={20} color={TEXT} />
        </View>
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
  bottomSheet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 16,
  },
  sheetTitle: {
    color: TEXT,
    fontWeight: "600",
  },
  sheetCount: {
    color: TEXT,
    fontWeight: "700",
  },
  sheetPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: "center",
    justifyContent: "center",
  },
});
