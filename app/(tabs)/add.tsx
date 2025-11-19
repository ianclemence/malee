import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

  const suggestions = ["Щегольской", "Франтовый", "Пижонский"];

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Add new word</Text>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="close" size={24} color={TEXT} />
          </Pressable>
        </View>

        <TextInput
          value={word}
          onChangeText={setWord}
          placeholder="Enter word"
          placeholderTextColor={TEXT}
          style={styles.inputWord}
        />

        <TextInput
          value={translation}
          onChangeText={setTranslation}
          placeholder="Translation"
          placeholderTextColor={TEXT}
          style={styles.inputTranslation}
        />

        <Text style={styles.helpText}>
          Press space to choose a suggested option or select alternative
          translations
        </Text>

        <View style={styles.suggestionsRow}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              style={styles.suggestionChip}
              onPress={() => setTranslation(s)}
            >
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
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
    paddingBottom: 24,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    position: "relative",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT,
    textAlign: "center",
  },
  iconButton: {
    position: "absolute",
    right: 0,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWord: {
    borderBottomWidth: 2,
    borderColor: TEXT,
    paddingVertical: 8,
    fontSize: 24,
    color: TEXT,
    marginBottom: 12,
  },
  inputTranslation: {
    borderBottomWidth: 2,
    borderColor: TEXT,
    paddingVertical: 8,
    fontSize: 20,
    color: TEXT,
    opacity: 0.7,
    marginBottom: 12,
  },
  helpText: {
    color: TEXT,
    opacity: 0.7,
    marginBottom: 12,
    fontSize: 18,
  },
  suggestionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  suggestionChip: {
    backgroundColor: "#EDE6D6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: TEXT,
  },
  suggestionText: {
    color: TEXT,
    fontWeight: "700",
  },
  addButton: {
    height: 56,
    backgroundColor: "#000000",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: TEXT,
  },
  addButtonText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 22,
  },
});
