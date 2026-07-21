import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Order, Product } from "@/constants/types";
import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

export default function OrderDetails() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
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

    const fetchOrderDetails = async () => {
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        try {
            const config = await getHeaders();
            const response = await api.get(`/orders/${id}`, config);
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching order details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            const config = await getHeaders();
            const response = await api.put(`/orders/${id}/cancel`, {}, config);
            if (response.data.success) {
                Toast.show({ type: 'success', text1: 'Order Cancelled' });
                fetchOrderDetails();
            }
        } catch (error: any) {
            console.log("Error cancelling order:", error);
            Toast.show({ type: 'error', text1: 'Failed to cancel', text2: error?.response?.data?.message || 'Try again later' });
        } finally {
            setCancelling(false);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchOrderDetails();
        }
    }, [id, isLoaded, isSignedIn]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950 justify-center items-center">
                <ActivityIndicator size="large" color={isDark ? '#FFF' : COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950 justify-center items-center">
                <Text className="dark:text-gray-400">Order not found</Text>
            </SafeAreaView>
        );
    }

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const ORDER_STEPS = order.orderStatus === 'cancelled'
        ? [
            { title: "Order Placed", date: formatDate(order.createdAt), completed: true, isError: false },
            { title: "Cancelled", date: "", completed: true, isError: true },
        ]
        : [
            { title: "Order Placed", date: formatDate(order.createdAt), completed: true, isError: false },
            { title: "Processing", date: "", completed: ['processing', 'shipped', 'delivered'].includes(order.orderStatus), isError: false },
            { title: "Shipped", date: "", completed: ['shipped', 'delivered'].includes(order.orderStatus), isError: false },
            { title: "Delivered", date: "", completed: order.orderStatus === 'delivered', isError: false },
        ];

    return (
        <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
            <Header title={`Order #${order.orderNumber}`} showBack />

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Order Status */}
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                    <Text className="text-lg font-bold text-primary dark:text-white mb-4">Order Status</Text>

                    {ORDER_STEPS.map((step, index) => (
                        <View key={index} className="flex-row mb-4 last:mb-0">
                            <View className="items-center mr-4">
                                <View className={`w-3 h-3 rounded-full ${step.completed ? (step.isError ? 'bg-red-500' : 'bg-primary dark:bg-white') : 'bg-gray-300 dark:bg-gray-700'}`} />
                                {index !== ORDER_STEPS.length - 1 && (
                                    <View className={`w-0.5 h-full ${step.completed ? (step.isError ? 'bg-red-500' : 'bg-primary dark:bg-white') : 'bg-gray-300 dark:bg-gray-700'} absolute top-3`} />
                                )}
                            </View>
                            <View className="pb-4">
                                <Text className={`font-bold ${step.completed ? (step.isError ? 'text-red-500' : 'text-primary dark:text-white') : 'text-gray-500 dark:text-gray-400'}`}>{step.title}</Text>
                                {step.date ? <Text className="text-secondary dark:text-gray-400 text-xs">{step.date}</Text> : null}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Items */}
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                    <Text className="text-lg font-bold text-primary dark:text-white mb-4">Products</Text>
                    {order.items.map((item: any, index: number) => {

                        const productData = item.product as Product;
                        const image = productData?.images?.[0];

                        return (
                            <View key={index} className={`flex-row ${index !== order.items.length - 1 && 'border-b border-gray-100 dark:border-gray-800 pb-4 mb-4'}`}>
                                {image && <Image source={{ uri: image }} className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800" resizeMode="contain" />}
                                <View className="flex-1 ml-3 justify-center">
                                    <Text className="text-primary dark:text-white font-medium" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-secondary dark:text-gray-400 text-xs">Size: {item.size}</Text>
                                    <View className="flex-row justify-between items-center mt-2">
                                        <Text className="text-primary dark:text-white font-bold">${item.price}</Text>
                                        <Text className="text-secondary dark:text-gray-400 text-xs">Qty: {item.quantity}</Text>
                                    </View>
                                </View>
                            </View>
                        )
                    })}
                </View>

                {/* Shipping Details */}
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-800">
                    <Text className="text-lg font-bold text-primary dark:text-white mb-2">Shipping Details</Text>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                        <Text className="text-secondary dark:text-gray-400 ml-2 flex-1">
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}, {order.shippingAddress?.country}
                        </Text>
                    </View>
                </View>

                {/* Payment Summary */}
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-8 border border-gray-100 dark:border-gray-800">
                    <Text className="text-lg font-bold text-primary dark:text-white mb-4">Payment Summary</Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary dark:text-gray-400">Payment Method</Text>
                        <Text className="text-primary dark:text-white font-medium capitalize">{order.paymentMethod}</Text>
                    </View>
                    {order.paymentStatus !== 'pending' && (
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-secondary dark:text-gray-400">Payment Status</Text>
                            <Text className={`font-medium capitalize ${
                                order.paymentStatus === 'paid' ? 'text-green-600 dark:text-green-400' : 
                                ['failed', 'cancelled'].includes(order.paymentStatus) ? 'text-red-600 dark:text-red-400' : 
                                'text-orange-500 dark:text-orange-400'
                            }`}>
                                {order.paymentStatus}
                            </Text>
                        </View>
                    )}
                    <View className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary dark:text-gray-400">Subtotal</Text>
                        <Text className="text-primary dark:text-white font-medium">${order.subtotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary dark:text-gray-400">Shipping</Text>
                        <Text className="text-primary dark:text-white font-medium">${order.shippingCost.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-secondary dark:text-gray-400">Tax</Text>
                        <Text className="text-primary dark:text-white font-medium">${order.tax.toFixed(2)}</Text>
                    </View>
                    <View className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                    <View className="flex-row justify-between">
                        <Text className="text-primary dark:text-white font-bold text-lg">Total</Text>
                        <Text className="text-primary dark:text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Cancel Button */}
                {(order.orderStatus === 'placed' || order.orderStatus === 'processing') && (
                    <TouchableOpacity 
                        className={`border-2 border-red-500 py-4 rounded-xl items-center mb-10 ${cancelling ? 'opacity-50' : ''}`}
                        onPress={handleCancelOrder}
                        disabled={cancelling}
                    >
                        {cancelling ? (
                            <ActivityIndicator color="#ef4444" />
                        ) : (
                            <Text className="text-red-500 font-bold text-lg">Cancel Order</Text>
                        )}
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
