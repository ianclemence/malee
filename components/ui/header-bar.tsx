import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconButton } from '@/components/ui/icon-button';
import { Palette } from '@/constants/theme';

type HeaderBarProps = {
  title?: string;
  leftIconName?: string;
  rightIconName?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  style?: ViewStyle;
};

export function HeaderBar({ title, leftIconName, rightIconName, onLeftPress, onRightPress, style }: HeaderBarProps) {
  const TEXT = Palette.black;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }, style]}>
      <View style={{ width: 40 }}>
        {leftIconName ? <IconButton icon={leftIconName} onPress={onLeftPress} /> : null}
      </View>
      {title ? <ThemedText type="title" style={{ color: TEXT }}>{title}</ThemedText> : <View style={{ width: 40 }} />}
      <View style={{ width: 40, alignItems: 'flex-end' }}>
        {rightIconName ? <IconButton icon={rightIconName} onPress={onRightPress} /> : null}
      </View>
    </View>
  );
}