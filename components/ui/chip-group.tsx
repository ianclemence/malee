import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Palette, Radii, Strokes, Shadows } from '@/constants/theme';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { PressScaleValues, SpringPresets } from '@/lib/animation-utils';

type Option = { label: string; value: string };

type ChipGroupProps = {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
};

function Chip({
  opt,
  active,
  onPress,
}: {
  opt: Option;
  active: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        'worklet';
        scale.value = withSpring(PressScaleValues.subtle, SpringPresets.quick);
      }}
      onPressOut={() => {
        'worklet';
        scale.value = withSpring(1, SpringPresets.quick);
      }}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          {
            paddingVertical: 12,
            borderRadius: Radii.button,
            backgroundColor: active ? Palette.black : Palette.white,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: Strokes.thin,
            borderColor: active ? Palette.black : Palette.black,
            ...(Shadows.brutalist as any),
          },
          animatedStyle,
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: active ? Palette.primary : Palette.black,
            opacity: active ? 1 : 0.6,
            fontFamily: 'Inter_700Bold',
          }}
        >
          {opt.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          opt={opt}
          active={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </View>
  );
}
