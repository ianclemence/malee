import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Palette, Radii, Strokes, Shadows } from '@/constants/theme';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <ThemedText type="title">This is a modal</ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radii.modal,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
    padding: 24,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
