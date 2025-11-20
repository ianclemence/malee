import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Palette, Radii, Strokes, Shadows } from '@/constants/theme';

type Option = { label: string; value: string };

type ChipGroupProps = {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
};

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  const TEXT = Palette.black;

  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: Radii.button,
              backgroundColor: active ? TEXT : Palette.white,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: Strokes.thin,
              borderColor: active ? TEXT : Palette.black,
              ...(Shadows.brutalist as any),
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: active ? Palette.primary : TEXT,
                opacity: active ? 1 : 0.6,
                fontFamily: 'Inter_700Bold',
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}