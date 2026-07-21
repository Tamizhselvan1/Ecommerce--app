import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

export default function AdminLayout() {
    const { user, isLoaded } = useUser()
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
  
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && (!user || user.publicMetadata?.role !== "admin")) {
            router.replace("/(tabs)");
        }
    }, [isLoaded, user]);

    if (!isLoaded) {
        return (
            <View className="flex-1 justify-center items-center bg-surface dark:bg-gray-900">
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!user || user.publicMetadata?.role !== "admin") return null;

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: isDark ? "#030712" : "#fff",
                },
                headerTintColor: isDark ? "#fff" : COLORS.primary,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
                headerShadowVisible: false,
                tabBarStyle: {
                    backgroundColor: isDark ? "#030712" : "#fff",
                    borderTopColor: isDark ? "#1f2937" : "#f3f4f6",
                },
                tabBarActiveTintColor: isDark ? "#fff" : COLORS.primary,
                tabBarInactiveTintColor: "gray",
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)")}
                        className="mr-4 flex-row items-center"
                    >
                        <Ionicons name="log-out-outline" size={24} color={isDark ? "#fff" : COLORS.primary} />
                        <Text className="ml-1 text-primary dark:text-white font-medium">Exit</Text>
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: "Products",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: "Orders",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="receipt-outline" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}
