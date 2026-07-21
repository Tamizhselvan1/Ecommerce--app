import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItemProps } from '@/constants/types';
import { COLORS } from '@/constants';
import { useColorScheme } from 'nativewind';

const CartItems = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  const imageUrl = item.product.images[0];
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      className="flex-row bg-white dark:bg-gray-900 rounded-3xl p-4 mb-4"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 6,
      }}
    >
      {/* Product Image */}
      <View className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Details */}
      <View className="flex-1 ml-4 justify-between">
        {/* Top */}
        <View className="flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text
              numberOfLines={2}
              className="text-lg font-bold text-gray-900 dark:text-gray-100"
            >
              {item.product.name}
            </Text>

            <Text className="text-gray-500 dark:text-gray-400 mt-1">
              Size: <Text className="font-semibold">{item.size}</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={onRemove}>
            <Ionicons
              name="trash-outline"
              size={22}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom */}
        <View className="flex-row justify-between items-center mt-4">
          <View>
            <Text className="text-xl font-extrabold text-primary dark:text-white">
              ${item.product.price.toFixed(2)}
            </Text>
          </View>

          {/* Quantity */}
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-2">
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 items-center justify-center"
              onPress={() =>
                onUpdateQuantity &&
                item.quantity > 1 &&
                onUpdateQuantity(item.quantity - 1)
              }
            >
              <Ionicons
                name="remove"
                size={18}
                color={isDark ? '#FFF' : COLORS.primary}
              />
            </TouchableOpacity>

            <Text className="mx-4 text-base font-bold text-gray-900 dark:text-gray-100">
              {item.quantity}
            </Text>

            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-primary dark:bg-white items-center justify-center"
              onPress={() =>
                onUpdateQuantity &&
                onUpdateQuantity(item.quantity + 1)
              }
            >
              <Ionicons
                name="add"
                size={18}
                color={isDark ? '#000' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CartItems;