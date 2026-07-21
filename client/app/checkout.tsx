import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useCart } from "@/context/CartContext";
import { Address } from "@/constants/types";
import { dummyAddress } from "@/assets/assets";
import { COLORS } from "@/constants";
import Header from "@/components/Header";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

export default function Checkout() {
  const { cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "stripe">(
    "cash"
  );

  const shipping = 2.0;
  const tax = 0;
  const total = cartTotal + shipping + tax;

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

  const fetchAddress = async () => {
    if (!isLoaded || !isSignedIn) return;
    try {
      const config = await getHeaders();
      const response = await api.get('/addresses', config);
      if (response.data.success) {
        const addrList = response.data.data;
        if (addrList.length > 0) {
          // Get default address or first address
          const defaultAddress =
            addrList.find((a: any) => a.isDefault) || addrList[0];
          setSelectedAddress(defaultAddress as Address);
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load address",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please add a shipping address",
      });
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "stripe") {
        Toast.show({
          type: "info",
          text1: "Info",
          text2: "Stripe payment is not implemented yet",
        });
        return;
      }

      const config = await getHeaders();
      const response = await api.post('/orders', {
        shippingAddress: selectedAddress,
        paymentMethod
      }, config);

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Order placed successfully",
        });
        await clearCart(); // Clear cart in context since backend cleared it
        router.replace("/orders");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [isLoaded, isSignedIn]);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" color={isDark ? '#FFF' : COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={["top"]}>
        <Header title="Checkout" showBack/>

      {/* Address */}
      <ScrollView className="flex-1 px-4 mt-4">
        
        <Text className="text-lg font-bold text-primary dark:text-white mb-4">
          Shipping Address
        </Text>

        {selectedAddress ? (
         <View className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-6 shadow-sm border border-transparent dark:border-gray-800">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold dark:text-white">{selectedAddress.type}</Text>
                <TouchableOpacity
                onPress={()=>router.push('/addresses')}>
                    <Text className="text-accent text-sm">Change</Text>
                </TouchableOpacity>
            </View>
            <Text className="text-secondary dark:text-gray-400 leading-5">
                {selectedAddress.street},{selectedAddress.city}
                {'\n'}
                {selectedAddress.state}{selectedAddress.zipCode}
                {'\n'}
                {selectedAddress.country}
            </Text>
         </View>
        ) : (
          <TouchableOpacity onPress={()=>router.push('/addresses')} className="bg-white dark:bg-gray-900 p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100 dark:border-gray-800">
            <Text className="text-primary dark:text-white font-bold">Add Address</Text>
          </TouchableOpacity>
        )}

         {/* Payment */}
      
        <Text className="text-lg font-bold text-primary dark:text-white mb-4">
          Payment Method
        </Text>

        {/* Cash on Delivery Option */}
        <TouchableOpacity
         onPress={()=>setPaymentMethod('cash')}
         className = {`bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === 'cash' ? 'border-primary dark:border-white':'border-transparent dark:border-gray-800'}`}>
            <Ionicons name="cash-outline" size={24} color={isDark ? '#FFF' : COLORS.primary} className="mr-3" />
            <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-primary dark:text-white">Cash on Delivery</Text>
                <Text className="text-secondary dark:text-gray-400 text-xs mt-1">Pay when you receive the order</Text>
            </View>
            {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={24} color={isDark ? '#FFF' : COLORS.primary}/>}
        </TouchableOpacity>

        {/* Stripe option */}
        <TouchableOpacity
         onPress={()=>setPaymentMethod('stripe')}
         className = {`bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === 'stripe' ? 'border-primary dark:border-white':'border-transparent dark:border-gray-800'}`}>
            <Ionicons name="card-outline" size={24} color={isDark ? '#FFF' : COLORS.primary} className="mr-3" />
            <View className="ml-3 flex-1">
                <Text className="text-base font-bold text-primary dark:text-white">Pay with Card</Text>
                <Text className="text-secondary dark:text-gray-400 text-xs mt-1">Credit or Debit Card</Text>
            </View>
            {paymentMethod === 'stripe' && <Ionicons name="checkmark-circle" size={24} color={isDark ? '#FFF' : COLORS.primary}/>}
        </TouchableOpacity>

        {/* Order Summary */}
      <View className="p-4 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-100 dark:border-gray-800 rounded-xl mb-4">
        <Text className="text-lg font-bold text-primary dark:text-white mb-4">
          Order Summary
        </Text>

        {/* subtotal */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary dark:text-gray-400">Subtotal</Text>
          <Text className="font-bold dark:text-white">${cartTotal.toFixed(2)}</Text>
        </View>

        {/* shipping */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary dark:text-gray-400">Shipping</Text>
          <Text className="font-bold dark:text-white">${shipping.toFixed(2)}</Text>
        </View>

        {/* Tax */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-secondary dark:text-gray-400">Tax</Text>
          <Text className="font-bold dark:text-white">${tax.toFixed(2)}</Text>
        </View>

        {/* Total */}
        <View className="flex-row justify-between mb-6">
          <Text className="text-primary dark:text-white text-xl font-bold">Total</Text>
          <Text className="text-primary dark:text-white text-xl font-bold">
            ${total.toFixed(2)}
          </Text>
        </View>
        {/* place order button */}
        <TouchableOpacity onPress={handlePlaceOrder} disabled={loading} className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-400 dark:bg-gray-600' : 'bg-primary dark:bg-white'}`}>
          {loading ? <ActivityIndicator color={isDark ? COLORS.primary : 'white'}/> : <Text className="text-white dark:text-primary font-bold text-lg">Place Order</Text>}

        </TouchableOpacity>
      </View>
        
      </ScrollView>

    </SafeAreaView>
  );
}