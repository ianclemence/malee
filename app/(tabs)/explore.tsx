import { Image } from 'expo-image';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

const ACCENT = '#F1FF00';
const TEXT = '#000000';
const BG = '#FFFFFF';
const BLUE_BG = '#C9D9FF';
const GREEN_BG = '#E8F4C8';
const BEIGE_BG = '#EDE6D6';

export default function DecksScreen() {
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  return (
    <ScrollView style={{ backgroundColor: BG }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MALEE</Text>
        <MaterialIcons name="settings" size={24} color={TEXT} />
      </View>

      <View style={styles.featuredLarge}>
        <Image source={require('@/assets/images/react-logo.png')} style={styles.largeImage} />
        <View style={styles.featureRow}>
          <Text style={styles.largeTitle}>British slang 2</Text>
          <View style={styles.countRow}>
            <MaterialIcons name="style" size={18} color={TEXT} />
            <Text style={styles.largeCount}>16</Text>
          </View>
        </View>
        <Pressable
          style={styles.favoriteBtn}
          onPress={() => setLiked((v) => !v)}>
          <MaterialIcons
            name={liked ? 'favorite' : 'favorite-border'}
            size={22}
            color={ACCENT}
          />
        </Pressable>
      </View>

      <View style={styles.grid}>
        <Pressable style={[styles.card, { backgroundColor: GREEN_BG }]} onPress={() => router.push({ pathname: '/deck/[slug]', params: { slug: 'aviation', title: 'Aviation', count: '40' } })}>
          <View style={styles.cardContent}>
            <MaterialIcons name="flight-takeoff" size={48} color={TEXT} style={{ alignSelf: 'flex-start' }} />
            <Text style={styles.deckLabel}>Aviation</Text>
          </View>
        </Pressable>
        <Pressable style={[styles.card, { backgroundColor: BEIGE_BG }]} onPress={() => router.push({ pathname: '/deck/[slug]', params: { slug: 'airport', title: 'At the airport', count: '46' } })}>
          <View style={styles.cardContent}>
            <MaterialIcons name="flight" size={48} color={TEXT} style={{ alignSelf: 'flex-start' }} />
            <Text style={styles.deckLabel}>At the airport</Text>
          </View>
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 12,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT,
  },
  featuredLarge: {
    backgroundColor: BLUE_BG,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    padding: 16,
    minHeight: 280,
  },
  featureRow: {
    position: 'absolute',
    left: 16,
    right: 72,
    bottom: 16,
    alignItems: 'flex-start',
  },
  largeImage: {
    width: '100%',
    height: 200,
  },
  largeTitle: {
    color: TEXT,
    fontWeight: '700',
    fontSize: 18,
  },
  largeCount: {
    color: TEXT,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEXT,
    borderWidth: 2,
    borderColor: TEXT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  card: {
    width: '48%',
    height: 160,
    borderRadius: 16,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  deckLabel: {
    color: TEXT,
    fontWeight: '700',
    textAlign: 'left',
  },
});
