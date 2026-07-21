import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useColorScheme } from 'nativewind';

export default function Reviews() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
      <Header title="My Reviews" showBack />
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="star-half-outline" size={64} color={isDark ? '#9ca3af' : COLORS.secondary} className="mb-4" />
        <Text className="text-primary dark:text-white font-bold text-xl mb-2">No Reviews Yet</Text>
        <Text className="text-secondary dark:text-gray-400 text-center w-3/4">
          You haven't written any product reviews yet. Once you review products, they will appear here.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
