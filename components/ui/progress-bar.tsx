import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Palette } from '@/constants/theme';

type ProgressBarProps = {
  progress: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, height = 12, radius = 12, style }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={[
        {
          height,
          backgroundColor: Palette.black,
          borderRadius: radius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={{
          height: '100%',
          width: `${pct * 100}%`,
          backgroundColor: Palette.primary,
          borderRadius: radius,
        }}
      />
    </View>
  );
}