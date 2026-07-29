import { Palette, Radii, Shadows, Strokes } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const TEXT = Palette.black;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderRadius: Radii.button,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 16,
        marginBottom: 24,
        borderWidth: Strokes.regular,
        borderColor: Palette.black,
        ...(Shadows.brutalist as any),
        gap: 12,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: Palette.white,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: Strokes.thin,
          borderColor: Palette.black,
          ...(Shadows.brutalist as any),
        }}
      >
        <MaterialIcons name="search" size={20} color={TEXT} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search decks...'}
        placeholderTextColor="rgba(0,0,0,0.4)"
        style={{ flex: 1, color: TEXT, fontSize: 16, fontFamily: 'Outfit_400Regular' }}
      />
    </View>
  );
}