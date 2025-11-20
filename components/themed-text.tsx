import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontSizes, Palette } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'phrase';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'phrase' ? styles.phrase : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    fontFamily: 'Inter_500Medium',
  },
  defaultSemiBold: {
    fontSize: FontSizes.body,
    lineHeight: 24,
    fontFamily: 'Inter_700Bold',
  },
  title: {
    fontSize: FontSizes.h1,
    lineHeight: 32,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  subtitle: {
    fontSize: FontSizes.h2,
    fontFamily: 'Inter_700Bold',
  },
  link: {
    lineHeight: 30,
    fontSize: FontSizes.body,
    color: Palette.primary,
    fontFamily: 'Inter_700Bold',
  },
  phrase: {
    fontSize: FontSizes.phrase,
    fontFamily: 'PlayfairDisplay_500Medium',
  },
});
