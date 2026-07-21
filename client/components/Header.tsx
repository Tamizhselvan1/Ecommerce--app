import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";

import { HeaderProps } from "@/constants/types";
import { COLORS } from "@/constants";
import { useCart } from "@/context/CartContext";

export default function Header({
  title,
  showBack,
  showSearch,
  showCart,
  showMenu,
  showLogo,
}: HeaderProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#f3f4f6' : COLORS.primary;

  const { itemCount = 0 } = useCart() || {};

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-950">
      {/* Left Section */}
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {showMenu && (
          <TouchableOpacity className="mr-3">
            <Ionicons
              name="menu-outline"
              size={28}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {showLogo ? (
          <View className="flex-1">
            <Image
              source={require("@/assets/logo.png")}
              style={{ width: "100%", height: 24 }}
              resizeMode="contain"
            />
          </View>
        ) : title ? (
          <Text className="flex-1 text-center text-xl font-bold text-primary dark:text-gray-100">
            {title}
          </Text>
        ) : (
          <View className="flex-1" />
        )}
      </View>

      {/* Right Section */}
      <View className="flex-row items-center space-x-4">
        {showSearch && (
          <TouchableOpacity>
            <Ionicons
              name="search-outline"
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity className="ml-4" onPress={()=> router.push('/(tabs)/cart')}>
            <View className="relative">
              <Ionicons
                name="bag-outline"
                size={24}
                color={iconColor}
              />

              {itemCount > 0 && (
                <View className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent items-center justify-center">
                  <Text className="text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}