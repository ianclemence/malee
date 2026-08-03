import { ToastProvider } from '@/components/ui/toast-context';
import { BottomSheetProvider } from '@/hooks/bottom-sheet-store';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { Outfit_400Regular } from '@expo-google-fonts/outfit/400Regular';
import { Outfit_500Medium } from '@expo-google-fonts/outfit/500Medium';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit/600SemiBold';
import { Outfit_700Bold } from '@expo-google-fonts/outfit/700Bold';
import { RubikSprayPaint_400Regular } from '@expo-google-fonts/rubik-spray-paint';
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router/react-navigation";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    RubikSprayPaint_400Regular,
  });

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Initialize RevenueCat
    Purchases.setLogLevel(LOG_LEVEL.WARN);

    // Test Store key is used during development (works for both platforms).
    // Fall back to the platform-specific production keys once stores are connected.
    const testStoreKey = process.env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_API_KEY;
    const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;

    if (Platform.OS === 'android') {
      Purchases.configure({
        apiKey: testStoreKey || androidKey || '',
      });
    } else if (Platform.OS === 'ios') {
      Purchases.configure({
        apiKey: testStoreKey || iosKey || '',
      });
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <ToastProvider>
          <BottomSheetProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </BottomSheetProvider>
        </ToastProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
