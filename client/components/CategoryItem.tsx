import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { CategoryItemProps } from '@/constants/types'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { useColorScheme } from 'nativewind'

export default function CategoryItem({item, isSelected, onPress}: CategoryItemProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
   
    <TouchableOpacity className='mr-4 items-center' onPress={onPress}>
         <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${isSelected ? 'bg-primary dark:bg-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <Ionicons name={item.icon as any} size={24} color={isSelected ? (isDark ? '#000' : '#FFF') : (isDark ? '#e5e7eb' : COLORS.primary)} />
         </View>
         <Text className={`text-xs font-medium ${isSelected ? "text-primary dark:text-white" : 'text-secondary dark:text-gray-400'}`}>{item.name}</Text>
    </TouchableOpacity>
  )
}