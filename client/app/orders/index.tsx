import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS, getStatusColor } from "@/constants";
import type { Order } from "@/constants/types";
import { formatDate } from "@/assets/assets";

import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

export default function Orders() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getHeaders = async () => {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchOrders = async () => {
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        try {
            const config = await getHeaders();
            const response = await api.get('/orders', config);
            if(response.data.success){
                setOrders(response.data.data);
            }
        } catch(error) {
            console.log("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if(isLoaded && isSignedIn){
            fetchOrders();
        }
    }, [isLoaded, isSignedIn]);

    return (
        <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
            <Header title="My Orders" showBack />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={isDark ? '#FFF' : COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-secondary dark:text-gray-400 text-lg">No orders found</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-800 shadow-sm"
                            onPress={() => router.push(`/orders/${item._id}`)}
                        >
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-primary dark:text-white font-bold">Order #{item.orderNumber}</Text>
                                <Text className="text-secondary dark:text-gray-400 text-sm">{formatDate(item.createdAt)}</Text>
                            </View>

                            {/* Status Badges */}
                            <View className="flex-row gap-2 mb-3">
                                <View className={`px-2 py-1 rounded-full ${getStatusColor(item.orderStatus).bg}`}>
                                    <Text className={`text-xs font-bold capitalize ${getStatusColor(item.orderStatus).text}`}>
                                        {item.orderStatus}
                                    </Text>
                                </View>

                                {item.paymentStatus !== 'pending' && (
                                    <View className={`px-2 py-1 rounded-full ${
                                        item.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30' : 
                                        ['cancelled', 'failed'].includes(item.paymentStatus) ? 'bg-red-100 dark:bg-red-900/30' :
                                        'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                        <Text className={`text-xs font-bold capitalize ${
                                            item.paymentStatus === 'paid' ? 'text-green-700 dark:text-green-400' : 
                                            ['cancelled', 'failed'].includes(item.paymentStatus) ? 'text-red-700 dark:text-red-400' :
                                            'text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {item.paymentStatus}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-secondary dark:text-gray-400 text-xs">Payment Method: <Text className="text-primary dark:text-white font-medium capitalize">{item.paymentMethod}</Text></Text>
                            </View>

                            {/* Product Images */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                {item.items.map((prod: any, idx) => {
                                    const image = prod.product?.images?.[0];
                                    return (
                                        <View key={idx} className="mr-3 border border-gray-100 dark:border-gray-800 rounded-md p-1 bg-gray-50 dark:bg-gray-800">
                                            {image ? (
                                                <Image
                                                    source={{ uri: image }}
                                                    className="w-12 h-12 rounded-md"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md justify-center items-center">
                                                    <Ionicons name="image-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </ScrollView>

                            <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <Text className="text-secondary dark:text-gray-400">Items: {item.items.length}</Text>
                                <Text className="text-primary dark:text-white font-bold text-lg">${item.totalAmount.toFixed(2)}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
