import { ProgressRing } from "@/components/progress-ring";
import { DEFAULT_DECKS } from "@/data/decks";
import { CurrentDeck, getAllDueCards, getCurrentDeck, getCustomDecks, getFavorites, getSettings, getTodayInteractions, setFavorite } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const ACCENT = "#F1FF00";
const BG = "#FFFFFF";
const TEXT = "#000000";
const PURPLE_BG = "#D9D4F6";

export default function HomeScreen() {
  const [todayCount, setTodayCount] = useState(0);
  const router = useRouter();
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const [currentDeck, setCurrentDeck] = useState<CurrentDeck | null>(null);
  const [totalDue, setTotalDue] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(50);

  const loadData = async () => {
    const fav = await getFavorites();
    const t = await getTodayInteractions();
    const c = await getCurrentDeck();
    const s = await getSettings();

    const customDecks = await getCustomDecks();
    const allDecks = [...DEFAULT_DECKS, ...customDecks];
    const slugs = allDecks.map(d => d.slug);
    const sizes = allDecks.reduce((acc: any, d) => ({ ...acc, [d.slug]: d.words.length }), {});
    const due = await getAllDueCards(slugs, sizes);

    setFavorites(fav);
    setTodayCount(t);
    setCurrentDeck(c);
    setTotalDue(due);
    setDailyGoal(s.dailyGoal);
  };

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const picked = useMemo(() => {
    const decks = DEFAULT_DECKS.map((d) => ({ ...d, count: d.words.length }));
    const shuffled = decks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, []);

  const dailyProgress = Math.min(1, todayCount / dailyGoal);
  const greeting = todayCount === 0 ? "Good Morning!" : (todayCount >= dailyGoal ? "Goal Reached!" : "Keep it up!");

  return (
    <ScrollView
      style={{ backgroundColor: BG }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>MALEE</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Image
            source={require("@/assets/images/react-logo.png")}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#E0E0E0" }}
          />
        </Pressable>
      </View>

      {/* Hero / Daily Goal Section */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroGreeting}>{greeting}</Text>
            <Text style={styles.heroSubtext}>
              {todayCount >= dailyGoal ? "You're on fire!" : "Let's hit your daily goal."}
            </Text>
            <Pressable
              style={styles.heroButton}
              onPress={() => {
                if (currentDeck) {
                  router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } });
                } else {
                  router.push('/(tabs)/explore');
                }
              }}
            >
              <Text style={styles.heroButtonText}>{todayCount === 0 ? "Start Learning" : "Continue"}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={TEXT} />
            </Pressable>
          </View>

          <View style={styles.ringWrapper}>
            <ProgressRing radius={50} stroke={8} progress={dailyProgress} color={ACCENT} trackColor="rgba(0,0,0,0.1)" />
            <View style={styles.ringInner}>
              <Text style={styles.ringCount}>{todayCount}</Text>
              <Text style={styles.ringLabel}>/ {dailyGoal} XP</Text>
            </View>
          </View>
        </View>

        {/* Decorative Icon */}
        <MaterialIcons name="bolt" size={120} color="rgba(0,0,0,0.03)" style={styles.heroBgIcon} />
      </View>

      {/* Daily Review or Jump Back In */}
      {totalDue > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Review</Text>
          <Pressable
            style={styles.resumeCard}
            onPress={() => {
              if (currentDeck) {
                router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } });
              } else {
                router.push('/(tabs)/explore');
              }
            }}
          >
            <View style={styles.resumeContent}>
              <Text style={styles.resumeTitle}>Review Session</Text>
              <Text style={styles.resumeSub}>{totalDue} cards due today</Text>
            </View>
            <View style={styles.resumeAction}>
              <View style={[styles.resumePlayIcon, { position: 'relative' }]}>
                <MaterialIcons name="layers" size={24} color={TEXT} />
              </View>
            </View>
          </Pressable>
        </View>
      ) : currentDeck && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jump Back In</Text>
          <Pressable
            style={styles.resumeCard}
            onPress={() => router.push({ pathname: '/deck/learn', params: { slug: currentDeck.slug, title: currentDeck.title, count: String(currentDeck.count) } })}
          >
            <View style={styles.resumeContent}>
              <Text style={styles.resumeTitle}>{currentDeck.title}</Text>
              <Text style={styles.resumeSub}>{currentDeck.count} cards</Text>
            </View>
            <View style={styles.resumeAction}>
              <ProgressRing radius={24} stroke={4} progress={currentDeck.progress} color={ACCENT} trackColor="#E0E0E0" />
              <View style={styles.resumePlayIcon}>
                <MaterialIcons name="play-arrow" size={24} color={TEXT} />
              </View>
            </View>
          </Pressable>
        </View>
      )}

      {/* Picked by Malee - Horizontal Scroll */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Picked by Malee</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {picked.map((d, i) => (
            <Pressable
              key={d.slug}
              style={[styles.horizontalCard, { backgroundColor: i % 2 === 0 ? PURPLE_BG : "#EFEFEF" }]}
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
              <View style={styles.cardIcon}>
                <MaterialIcons name={d.icon as any} size={32} color={TEXT} />
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.cardTitle} numberOfLines={2}>{d.title}</Text>
                <View style={styles.cardMeta}>
                  <Text style={styles.cardCount}>{d.count} words</Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      const next = !favorites[d.slug];
                      setFavorites((p) => ({ ...p, [d.slug]: next }));
                      setFavorite(d.slug, next);
                    }}
                  >
                    <MaterialIcons name={favorites[d.slug] ? "favorite" : "favorite-border"} size={20} color={favorites[d.slug] ? "#FF4444" : TEXT} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    marginTop: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: "900",
    color: TEXT,
    letterSpacing: -1,
  },
  hero: {
    backgroundColor: TEXT,
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  heroGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: "#FFFFFF",
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: ACCENT,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroButtonText: {
    fontWeight: '700',
    color: TEXT,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringCount: {
    fontSize: 20,
    fontWeight: '800',
    color: "#FFFFFF",
  },
  ringLabel: {
    fontSize: 10,
    color: "#FFFFFF",
    opacity: 0.6,
  },
  heroBgIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 0,
    transform: [{ rotate: '-15deg' }],
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 16,
  },
  resumeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  resumeContent: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  resumeSub: {
    fontSize: 14,
    color: TEXT,
    opacity: 0.5,
  },
  resumeAction: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumePlayIcon: {
    position: 'absolute',
  },
  horizontalScroll: {
    paddingRight: 16,
    gap: 16,
  },
  horizontalCard: {
    width: 160,
    height: 180,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.5)",
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBottom: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCount: {
    fontSize: 12,
    color: TEXT,
    opacity: 0.6,
  },
});
