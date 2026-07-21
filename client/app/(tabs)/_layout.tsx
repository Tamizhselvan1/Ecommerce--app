import { Tabs } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useCart } from "@/context/CartContext";
import { View } from "react-native";
import { useColorScheme } from "nativewind";

export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {cartItems} = useCart()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#FFF' : COLORS.primary,
        tabBarInactiveTintColor: isDark ? '#4B5563' : "#CDCDE0",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#030712' : "#fff",
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1f2937' : "#F0F0F0",
          height: 56,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => ( 
           <View className="relative">
            <Feather name="shopping-cart" size={26} color={color} />
            {cartItems?.length > 0 &&
            <View className="absolute -top-2 -right-2 bg-accent size-3 rounded-full items-center justify-center">
              <Ionicons name="ellipse" size={6} color='white' />
            </View>
          }
           </View>
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}