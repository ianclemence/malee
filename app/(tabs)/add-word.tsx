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
            <Text style={styles.helperText}>Suggestions</Text>
            <View style={styles.suggestionsRow}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  style={styles.suggestionChip}
                  onPress={() => setWord(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <Pressable style={styles.addButton}>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
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
  suggestionText: {
    color: TEXT,
    fontWeight: "600",
    fontSize: 14,
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