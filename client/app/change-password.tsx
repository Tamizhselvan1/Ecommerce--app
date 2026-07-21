import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Header from '@/components/Header';
import { COLORS } from '@/constants';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePassword() {
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all password fields',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'New passwords do not match',
      });
      return;
    }

    try {
      setSaving(true);
      await user?.updatePassword({
        currentPassword,
        newPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password updated successfully',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update password',
        text2: error?.errors?.[0]?.message || error.message || 'An error occurred',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-900" edges={['top']}>
      <Header title="Change Password" showBack />
      
      <View className="flex-1 px-4 mt-4">
        <View className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          
          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2">Current Password</Text>
          <View className="bg-surface dark:bg-gray-900 rounded-lg mb-4 flex-row items-center pr-4">
            <TextInput
              className="flex-1 p-4 text-primary dark:text-white"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              secureTextEntry={!showCurrent}
              style={{ outlineStyle: 'none' } as any}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
              <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2">New Password</Text>
          <View className="bg-surface dark:bg-gray-900 rounded-lg mb-4 flex-row items-center pr-4">
            <TextInput
              className="flex-1 p-4 text-primary dark:text-white"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!showNew}
              style={{ outlineStyle: 'none' } as any}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
              <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
            </TouchableOpacity>
          </View>

          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2">Confirm New Password</Text>
          <View className="bg-surface dark:bg-gray-900 rounded-lg mb-6 flex-row items-center pr-4">
            <TextInput
              className="flex-1 p-4 text-primary dark:text-white"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!showNew}
              style={{ outlineStyle: 'none' } as any}
            />
          </View>

          <TouchableOpacity 
            className={`p-4 rounded-xl items-center flex-row justify-center shadow-sm ${saving ? 'bg-primary/70 dark:bg-indigo-600/70' : 'bg-primary dark:bg-indigo-600'}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-bold text-lg">Update Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
