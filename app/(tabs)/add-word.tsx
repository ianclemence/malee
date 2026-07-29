import { ThemedText } from '@/components/themed-text';
import { ProGate } from '@/components/ProGate';
import { useToast } from '@/components/ui/toast-context';
import { FontSizes, Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import { addWordToCustomDeck, CustomDeck, getCustomDecks, saveCustomDeck } from "@/lib/storage";
import { usePurchases } from "@/lib/purchases";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const ACCENT = Palette.primary;
const TEXT = Palette.black;
const BG = Palette.cream;

export default function AddWordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { isPro } = usePurchases();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");

  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [selectedDeckSlug, setSelectedDeckSlug] = useState<string | null>(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const wordInputRef = useRef<TextInput>(null);

  const loadDecks = async () => {
    const d = await getCustomDecks();
    setDecks(d);
    if (d.length > 0 && !selectedDeckSlug) {
      setSelectedDeckSlug(d[0].slug);
    } else if (d.length === 0) {
      setIsCreatingDeck(true);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
      // Focus the word input when the screen comes into focus
      const timer = setTimeout(() => {
        wordInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  const handleSave = async () => {
    if (!word.trim() || !translation.trim()) {
      Alert.alert("Missing Info", "Please enter both a word and translation.");
      return;
    }

    let targetSlug = selectedDeckSlug;

  // Create new deck if needed
  if (isCreatingDeck) {
    const name = newDeckName.trim();
    if (!name) {
      Alert.alert("Missing Info", "Please enter a name for your new deck.");
      return;
    }

    // Check deck limit for free users
    if (!isPro && decks.length >= 3) {
      router.push("/paywall");
      return;
    }

    // Check if deck with same name exists
      const existingDeck = decks.find(d => d.title.toLowerCase() === name.toLowerCase());

      if (existingDeck) {
        targetSlug = existingDeck.slug;
      } else {
        const slug = "custom-" + Date.now();
        const newDeck: CustomDeck = {
          slug,
          title: name,
          icon: "📚", // Default emoji
          bg: "#EFEFEF",
          createdAt: Date.now(),
          words: [],
        };
        await saveCustomDeck(newDeck);
        targetSlug = slug;
        // Refresh decks list and select the new one
        await loadDecks();
        setSelectedDeckSlug(slug);
        setIsCreatingDeck(false);
      }
    }

    if (!targetSlug) return;

    await addWordToCustomDeck(targetSlug, {
      en: word,
      th: translation,
    });

    showToast("Word added!", "success");
    setWord("");
    setTranslation("");
    setNewDeckName("");
  };

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.headerTitle}>Add New Word</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Word</ThemedText>
            <TextInput
              ref={wordInputRef}
              value={word}
              onChangeText={setWord}
              placeholder="e.g. Dapper"
              placeholderTextColor="rgba(0,0,0,0.3)"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Translation</ThemedText>
            <TextInput
              value={translation}
              onChangeText={setTranslation}
              placeholder="e.g. หรูหรา"
              placeholderTextColor="rgba(0,0,0,0.3)"
              style={styles.input}
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <ThemedText style={styles.helperText}>Add to Deck</ThemedText>
            <View style={styles.suggestionsRow}>
              {decks.map((d) => (
                <Pressable
                  key={d.slug}
                  style={[
                    styles.suggestionChip,
                    selectedDeckSlug === d.slug && !isCreatingDeck && styles.chipActive
                  ]}
                  onPress={() => {
                    setSelectedDeckSlug(d.slug);
                    setIsCreatingDeck(false);
                  }}
                >
                  <ThemedText style={[
                    styles.suggestionText,
                    selectedDeckSlug === d.slug && !isCreatingDeck && styles.chipTextActive
                  ]}>{d.title}</ThemedText>
                </Pressable>
              ))}
            </View>

            {isCreatingDeck ? (
              <View style={styles.newDeckInput}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <ThemedText style={styles.label}>New Deck Name</ThemedText>
                  <Pressable onPress={() => setIsCreatingDeck(false)}>
                    <Text style={{ color: TEXT, opacity: 0.5, fontSize: 12, fontWeight: '600' }}>Cancel</Text>
                  </Pressable>
                </View>
                <TextInput
                  value={newDeckName}
                  onChangeText={setNewDeckName}
                  placeholder="e.g. My Favorites"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  style={styles.input}
                />
              </View>
            ) : (
              <Pressable
                style={styles.createDeckBtn}
                onPress={() => {
                  setIsCreatingDeck(true);
                  setSelectedDeckSlug(null);
                }}
              >
                <ThemedText style={styles.createDeckText}>Create New Deck</ThemedText>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.submitBar} onPress={handleSave}>
          <ThemedText style={styles.submitText}>Add to Deck</ThemedText>
        </Pressable>
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
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: TEXT,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.white,
    borderRadius: 20,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  form: {
    gap: 24,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: FontSizes.body,
    color: TEXT,
    opacity: 0.6,
    fontFamily: 'Outfit_700Bold',
  },
  input: {
    fontSize: FontSizes.phrase,
    color: TEXT,
    borderBottomWidth: Strokes.regular,
    borderColor: Palette.black,
    paddingVertical: 8,
    fontFamily: 'Outfit_500Medium',
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
    opacity: 0.4,
    marginBottom: 12,
  },
  suggestionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: Palette.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.button,
    borderWidth: Strokes.thin,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  createDeckBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: Palette.white,
    borderRadius: Radii.button,
    borderStyle: 'dotted',
    gap: 8,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
  },
  createDeckText: {
    color: TEXT,
    fontFamily: 'Outfit_700Bold',
    fontSize: FontSizes.body,
  },
  suggestionText: {
    color: TEXT,
    fontFamily: 'Outfit_500Medium',
    fontSize: FontSizes.small,
  },
  chipActive: {
    backgroundColor: Palette.black,
    borderColor: Palette.black,
  },
  chipTextActive: {
    color: ACCENT,
  },
  newDeckInput: {
    marginTop: 16,
    gap: 8,
  },
  submitBar: {
    height: 64,
    backgroundColor: Palette.black,
    borderRadius: Radii.button,
    borderWidth: Strokes.regular,
    borderColor: Palette.black,
    ...Shadows.brutalist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: ACCENT,
    fontFamily: 'Outfit_700Bold',
    fontSize: FontSizes.button,
  },

});