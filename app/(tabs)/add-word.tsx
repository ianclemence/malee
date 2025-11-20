import { addWordToCustomDeck, CustomDeck, getCustomDecks, saveCustomDeck } from "@/lib/storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const ACCENT = "#F1FF00";
const TEXT = "#000000";
const BG = "#FFFFFF";

export default function AddWordScreen() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [translation, setTranslation] = useState("");

  const [decks, setDecks] = useState<CustomDeck[]>([]);
  const [selectedDeckSlug, setSelectedDeckSlug] = useState<string | null>(null);
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      loadDecks();
    }, [])
  );

  const loadDecks = async () => {
    const d = await getCustomDecks();
    setDecks(d);
    if (d.length > 0 && !selectedDeckSlug) {
      setSelectedDeckSlug(d[0].slug);
    } else if (d.length === 0) {
      setIsCreatingDeck(true);
    }
  };

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

      // Check if deck with same name exists
      const existingDeck = decks.find(d => d.title.toLowerCase() === name.toLowerCase());

      if (existingDeck) {
        targetSlug = existingDeck.slug;
      } else {
        const slug = "custom-" + Date.now();
        const newDeck: CustomDeck = {
          slug,
          title: name,
          icon: "style", // Default icon
          bg: "#EFEFEF",
          createdAt: Date.now(),
          words: [],
        };
        await saveCustomDeck(newDeck);
        targetSlug = slug;
      }
    }

    if (!targetSlug) return;

    await addWordToCustomDeck(targetSlug, {
      en: word,
      th: translation,
    });

    Alert.alert("Success", "Word added to deck!", [
      {
        text: "Add Another",
        onPress: () => {
          setWord("");
          setTranslation("");
          setNewDeckName("");
          // Keep the selected deck for convenience
        }
      },
      { text: "Done", onPress: () => router.back() }
    ]);
  };

  const suggestions = ["Dapper", "Fancy", "Posh"];

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Add Word</Text>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Word</Text>
            <TextInput
              value={word}
              onChangeText={setWord}
              placeholder="e.g. Dapper"
              placeholderTextColor="rgba(0,0,0,0.3)"
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Translation</Text>
            <TextInput
              value={translation}
              onChangeText={setTranslation}
              placeholder="e.g. หรูหรา"
              placeholderTextColor="rgba(0,0,0,0.3)"
              style={styles.input}
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <Text style={styles.helperText}>Add to Deck</Text>
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
                  <Text style={[
                    styles.suggestionText,
                    selectedDeckSlug === d.slug && !isCreatingDeck && styles.chipTextActive
                  ]}>{d.title}</Text>
                </Pressable>
              ))}
            </View>

            {isCreatingDeck ? (
              <View style={styles.newDeckInput}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.label}>New Deck Name</Text>
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
                  autoFocus
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
                <MaterialIcons name="add" size={20} color={TEXT} />
                <Text style={styles.createDeckText}>Create New Deck</Text>
              </Pressable>
            )}
          </View>
        </View>

        <Pressable style={styles.addButton} onPress={handleSave}>
          <Text style={styles.addButtonText}>Add to Deck</Text>
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
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: TEXT,
    letterSpacing: -1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  form: {
    gap: 24,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    opacity: 0.6,
  },
  input: {
    fontSize: 24,
    fontWeight: "600",
    color: TEXT,
    borderBottomWidth: 2,
    borderColor: "#E0E0E0",
    paddingVertical: 8,
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
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  createDeckBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: 'dashed',
  },
  createDeckText: {
    color: TEXT,
    fontWeight: "700",
    fontSize: 16,
  },
  suggestionText: {
    color: TEXT,
    fontWeight: "600",
    fontSize: 14,
  },
  chipActive: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  chipTextActive: {
    color: ACCENT,
  },
  newDeckInput: {
    marginTop: 16,
    gap: 8,
  },
  addButton: {
    height: 64,
    backgroundColor: TEXT,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  addButtonText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 20,
  },
});