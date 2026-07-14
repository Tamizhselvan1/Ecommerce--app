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

export default function Checkout() {
  const { cartTotal } = useCart();
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

  const fetchAddress = async () => {
    try {
      const addrList = dummyAddress;

      if (addrList.length > 0) {
        // Get default address or first address
        const defaultAddress =
          addrList.find((a: any) => a.isDefault) || addrList[0];

        setSelectedAddress(defaultAddress as Address);
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

      // Cash on Delivery
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order placed successfully",
      });

      router.replace("/orders");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  if (pageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
        <Header title="checkout " showBack/>

      {/* Address */}
      <ScrollView className="flex-1 px-4 mt-4">
        
        <Text className="text-lg font-bold text-primary mb-4">
          Shipping Address
        </Text>

        {selectedAddress ? (
         <View className="bg-white p-4 rounded-xl mb-6 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-base font-bold">{selectedAddress.type}</Text>
                <TouchableOpacity
                onPress={()=>router.push('/addresses')}>
                    <Text className="text-accent text-sm">Change</Text>
                </TouchableOpacity>
            </View>
            <Text className="text-secondary leading-5">
                {selectedAddress.street},{selectedAddress.city}
                {'\n'}
                {selectedAddress.state}{selectedAddress.zipCode}
                {'\n'}
                {selectedAddress.country}
            </Text>
         </View>
        ) : (
          <TouchableOpacity onPress={()=>router.push('/addresses')} className="bg-white p-6 rounded-xl mb-6 items-center justify-center border-dashed border-2 border-gray-100">
            <Text className="text-primary font-bold">Add Address</Text>
          </TouchableOpacity>
        )}

         {/* Payment */}
      
        <Text className="text-lg font-bold text-primary mb-4">
          Payment Method
        </Text>

        {/* Cash on Delivery Option */}
        <TouchableOpacity
         onPress={()=>setPaymentMethod('cash')}
         className = {`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === 'cash' ? 'border-primary':'border-transparent'}`}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} className="mr-3" />
            <View className="ml-3 flex-1">
                <Text className="ext-base font-bold text-primary">Cash on Delivery</Text>
                <Text className="text-secondary text-xs mt-1">Pay when you receive the order</Text>
            </View>
            {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary}/>}
        </TouchableOpacity>

        {/* Stripe option */}
        <TouchableOpacity
         onPress={()=>setPaymentMethod('stripe')}
         className = {`bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center border-2 ${paymentMethod === 'stripe' ? 'border-primary':'border-transparent'}`}>
            <Ionicons name="card-outline" size={24} color={COLORS.primary} className="mr-3" />
            <View className="ml-3 flex-1">
                <Text className="ext-base font-bold text-primary">Pay with Card</Text>
                <Text className="text-secondary text-xs mt-1">Credite or Debit Card</Text>
            </View>
            {paymentMethod === 'stripe' && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary}/>}
        </TouchableOpacity>

        {/* Order Summary */}
      <View className="p-4 bg-white shadow-lg border-t border-gray-100">
        <Text className="text-lg font-bold text-primary mb-4">
          Order Summary
        </Text>

        {/* subtotal */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Subtotal</Text>
          <Text className="font-bold">${cartTotal.toFixed(2)}</Text>
        </View>

        {/* shipping */}
        <View className="flex-row justify-between mb-2">
          <Text className="text-secondary">Shipping</Text>
          <Text className="font-bold">${shipping.toFixed(2)}</Text>
        </View>

        {/* Tax */}
        <View className="flex-row justify-between mb-4">
          <Text className="text-secondary">Tax</Text>
          <Text className="font-bold">${tax.toFixed(2)}</Text>
        </View>

        {/* Total */}
        <View className="flex-row justify-between mb-6">
          <Text className="text-primary text-xl font-bold">Total</Text>
          <Text className="text-primary text-xl font-bold">
            ${total.toFixed(2)}
          </Text>
        </View>
        {/* place order button */}
        <TouchableOpacity onPress={handlePlaceOrder} disabled={loading} className={`p-4 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-primary'}`}>
          {loading ? <ActivityIndicator color='white'/> : <Text className="text-white font-bold text-lg">Place Order</Text>}

        </TouchableOpacity>
      </View>
        
      </ScrollView>

    </SafeAreaView>
  );
}