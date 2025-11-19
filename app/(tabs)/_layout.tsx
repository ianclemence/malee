import { Tabs, useRouter } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import React from 'react';
import { View, Pressable } from 'react-native';
import BottomPlayer from '@/components/bottom-player';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#808080',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { backgroundColor: '#000000', borderTopWidth: 0, elevation: 0, justifyContent: 'space-between' },
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
          name="add-word"
          options={{
            title: '',
            tabBarLabel: () => null,
            tabBarButton: (props) => (
              <Pressable
                {...props}
                onPress={() => router.push('/add-word')}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: '#F1FF00',
                    borderWidth: 2,
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
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="rectangle.stack.fill" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
