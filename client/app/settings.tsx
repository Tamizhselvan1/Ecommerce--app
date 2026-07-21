import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function Settings() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [notifications, setNotifications] = React.useState(true);

  // Sync the switch visually with NativeWind's colorScheme
  const isDarkMode = colorScheme === 'dark';

  const toggleDarkMode = (value: boolean) => {
    setColorScheme(value ? 'dark' : 'light');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
      <Header title="Settings" showBack />
      <ScrollView className="flex-1 px-4 mt-4">
        
        <Text className="text-secondary dark:text-gray-400 font-bold text-sm mb-2 uppercase">Preferences</Text>
        <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden shadow-sm">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={20} color={isDarkMode ? '#e5e7eb' : COLORS.primary} className="mr-3" />
              <Text className="text-primary dark:text-gray-100 font-medium ml-3">Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#eee", true: COLORS.primary }}
            />
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons name="moon-outline" size={20} color={isDarkMode ? '#e5e7eb' : COLORS.primary} className="mr-3" />
              <Text className="text-primary dark:text-gray-100 font-medium ml-3">Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#374151", true: "#10b981" }}
            />
          </View>
        </View>

        <Text className="text-secondary dark:text-gray-400 font-bold text-sm mb-2 uppercase">Account</Text>
        <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden shadow-sm">
          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800 justify-between"
            onPress={() => router.push('/edit-profile')}
          >
            <Text className="text-primary dark:text-gray-100 font-medium">Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center p-4 justify-between"
            onPress={() => router.push('/change-password')}
          >
            <Text className="text-primary dark:text-gray-100 font-medium">Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

        <Text className="text-secondary dark:text-gray-400 font-bold text-sm mb-2 uppercase">Legal</Text>
        <View className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 mb-6 overflow-hidden shadow-sm">
          <TouchableOpacity 
            className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800 justify-between"
            onPress={() => router.push('/privacy-policy')}
          >
            <Text className="text-primary dark:text-gray-100 font-medium">Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center p-4 justify-between"
            onPress={() => router.push('/terms-of-service')}
          >
            <Text className="text-primary dark:text-gray-100 font-medium">Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
