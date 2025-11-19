import { Image } from 'expo-image';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

const ACCENT = '#F1FF00';
const TEXT = '#000000';
const PAGE_BG = '#D9D4F6';

export default function DeckScreen() {
  const { title, count, slug } = useLocalSearchParams<{ title?: string; count?: string; slug?: string }>();
  const router = useRouter();

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.illustrationHolder}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.illustration} />
        </View>

        <Text style={styles.titleText}>{title ?? 'Deck'}</Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.outlineButton}>
            <MaterialIcons name="add" size={18} color={TEXT} />
            <Text style={styles.outlineButtonText}>Add to favorites</Text>
          </Pressable>
          <Pressable style={styles.outlineButton}>
            <MaterialIcons name="collections-bookmark" size={18} color={TEXT} />
            <Text style={styles.outlineButtonText}>Add to my decks</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Deck learned</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{count ?? '0'}</Text>
            <Text style={styles.statLabel}>Words in deck</Text>
          </View>
        </View>

        <View style={styles.separator} />

        <Text style={styles.sectionTitle}>Words ({count ?? '0'})</Text>
      </ScrollView>

      <Pressable style={styles.floatingLearnBar} onPress={() => router.push({ pathname: '/deck/learn', params: { slug: slug ?? '', title: title ?? 'Deck', count: count ?? '0' } })}>
        <View style={styles.btnSide}>
          <View style={styles.playProgress}>
            <MaterialIcons name="play-arrow" size={20} color={ACCENT} />
          </View>
        </View>
        <Text style={styles.learnText}>Learn</Text>
        <View style={styles.btnSide} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationHolder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  illustration: {
    width: 280,
    height: 280,
  },
  titleText: {
    fontSize: 30,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 15,
  },
  outlineButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: TEXT,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  outlineButtonText: {
    color: TEXT,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 30,
    fontWeight: '700',
    color: TEXT,
  },
  statLabel: {
    color: TEXT,
    opacity: 0.7,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: TEXT,
    opacity: 0.2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 12,
  },
  floatingLearnBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    paddingHorizontal: 12,
  },
  learnText: {
    color: ACCENT,
    fontWeight: '700',
    fontSize: 22,
    textAlign: 'center',
    flex: 1,
  },
  btnSide: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playProgress: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});