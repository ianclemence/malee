import BottomPlayer from '@/components/bottom-player';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Palette, Strokes } from '@/constants/theme';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Palette.primary,
          tabBarInactiveTintColor: '#FFFFFF',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { backgroundColor: '#000000', borderTopWidth: 0, elevation: 0, justifyContent: 'space-between', height: 72 },
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
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="add-word"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarButton: () => (
              <Pressable
                onPress={() => router.push('/add-word')}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: Palette.primary,
                    borderWidth: Strokes.regular,
                    borderColor: '#000000',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: -12,
                  }}
                >
                  <MaterialIcons name="add" size={28} color="#000000" />
                </View>
              </Pressable>
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Decks',
            tabBarIcon: ({ color }) => <MaterialIcons name="explore" size={28} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
