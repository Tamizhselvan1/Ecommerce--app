import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Header from '@/components/Header';
import CartItems from '@/components/cartItems';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  // Calculate subtotal
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const shipping = 2.0;
  const total = cartTotal + shipping;

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
      <Header title="My Cart" showBack />

      {cartItems.length > 0 ? (
        <>
          <ScrollView
            className="flex-1 px-4 mt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {cartItems.map((item) => (
              <CartItems
                key={`${item.id}-${item.size}`}
                item={item}
                onRemove={() => removeFromCart(item.productId, item.size)}
                onUpdateQuantity={(q) =>
                  updateQuantity(item.productId, q, item.size)
                }
              />
            ))}
          </ScrollView>

          {/* Bottom Summary */}
          <View
            className="bg-white dark:bg-gray-900 rounded-t-3xl px-6 pt-6 pb-8 border-t border-transparent dark:border-gray-800"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: -4 },
              elevation: 12,
            }}
          >
            <View className="flex-row justify-between mb-3">
              <Text className="text-gray-500 dark:text-gray-400 text-base">Subtotal</Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                ${cartTotal.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-base">Shipping</Text>
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                ${shipping.toFixed(2)}
              </Text>
            </View>

            <View className="h-[1px] bg-gray-200 dark:bg-gray-800 mb-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Total
              </Text>

              <Text className="text-2xl font-extrabold text-primary dark:text-white">
                ${total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity onPress={()=>router.push('/checkout')} className="bg-primary dark:bg-white rounded-2xl py-4 items-center">
              <Text className="text-white dark:text-primary text-lg font-bold">
                Proceed to Checkout
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Your cart is empty
          </Text>

          <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            Looks like you haven`t added anything yet.
          </Text>

          <TouchableOpacity
            className="mt-6 bg-primary dark:bg-white px-8 py-4 rounded-full"
            onPress={() => router.push('/')}
          >
            <Text className="text-white dark:text-primary font-bold text-base">
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}