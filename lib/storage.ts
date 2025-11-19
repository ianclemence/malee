import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'malee:favorites';
const MYDECKS_KEY = 'malee:myDecks';

export type BoolMap = { [key: string]: boolean };

export async function getFavorites(): Promise<BoolMap> {
  const v = await AsyncStorage.getItem(FAVORITES_KEY);
  return v ? JSON.parse(v) : {};
}

export async function setFavorite(slug: string, liked: boolean): Promise<void> {
  const current = await getFavorites();
  const next = { ...current, [slug]: liked };
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

export async function getMyDecks(): Promise<BoolMap> {
  const v = await AsyncStorage.getItem(MYDECKS_KEY);
  return v ? JSON.parse(v) : {};
}

export async function setMyDeck(slug: string, added: boolean): Promise<void> {
  const current = await getMyDecks();
  const next = { ...current, [slug]: added };
  await AsyncStorage.setItem(MYDECKS_KEY, JSON.stringify(next));
}