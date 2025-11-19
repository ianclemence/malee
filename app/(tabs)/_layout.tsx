import { Tabs } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View } from 'react-native';
import BottomPlayer from '@/components/bottom-player';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#808080',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { backgroundColor: '#000000', borderTopWidth: 0, elevation: 0 },
          sceneContainerStyle: { backgroundColor: 'transparent' },
          tabBarBackground: () => <View style={{ backgroundColor: '#000000' }} />,
        }}
        tabBar={(props) => (
          <View style={{ backgroundColor: 'transparent' }}>
            <BottomPlayer inline />
            <BottomTabBar {...props} />
          </View>
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Decks',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
