import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Product } from "@/constants/types";
import { useWishlist } from "@/context/wishlistContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/constants";
import { useCart } from "@/context/CartContext";
import { ScrollView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { addToCart, cartItems, itemCount } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color={isDark ? '#FFF' : COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white dark:bg-gray-950">
        <Text className="dark:text-gray-100">Product not found</Text>
      </SafeAreaView>
    );
  }

  const isLiked = isInWishlist(product._id);

  const handleAddToCart = ()=>{
    if (!isLoaded || !isSignedIn) {
        Toast.show({
            type: 'error',
            text1: 'Authentication Required',
            text2: "Please sign in to add items to your cart"
        });
        return;
    }
    if(!selectedSize){
        Toast.show({
            type: 'info',
            text1: 'No Size Selected',
            text2: "please select a size"
        })
     return;
    }
    addToCart(product, selectedSize || "")
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Carousel */}
        <View className="relative h-[450px] bg-gray-100 dark:bg-gray-900 mb-6">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width
              );

              setActiveImageIndex(slide);
            }}
          >
            {product.images?.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{
                  width,
                  height: 450,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Header Buttons */}
          <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? '#FFF' : COLORS.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (!isLoaded || !isSignedIn) {
                    Toast.show({
                        type: 'error',
                        text1: 'Authentication Required',
                        text2: "Please sign in to use wishlist"
                    });
                    return;
                }
                toggleWishlist(product);
              }}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 items-center justify-center"
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? COLORS.accent : (isDark ? '#FFF' : COLORS.primary)}
              />
            </TouchableOpacity>
          </View>

          {/* Pagination Dots */}
          <View className="absolute bottom-5 left-0 right-0 flex-row justify-center items-center">
            {product.images?.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === activeImageIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor:
                    index === activeImageIndex
                      ? (isDark ? '#FFF' : COLORS.primary)
                      : (isDark ? '#4B5563' : "#D1D5DB"),
                }}
              />
            ))}
          </View>
        </View>

        {/* Product info */}
        <View className="px-5">
            {/* Title & Rating */}
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-2xl font-bold text-primary dark:text-gray-100 flex-1 mr-4">
                    {product.name}
                </Text>
                <View className="flex-row justify-between items-start mb-2">
                    <Ionicons name="star" size={14} color="#FFD700"/>
                    <Text className="text-sm font-bold dark:text-gray-100 ml-1">4.6</Text>
                    <Text className="text-xs text-secondary dark:text-gray-400 ml-1">(85)</Text>
                </View>
            </View>
         {/* price */}
          <Text className="text-2xl font-bold text-primary dark:text-white mt-6">
            ${product.price.toFixed(2)}
          </Text>

          {/* size */}
          {product.sizes && product.sizes.length >0 && (
            <>
            <Text className="text-base font-bold text-primary dark:text-gray-100 mb-3">Size</Text>
            <View className="flex-row gpa-3 mb-6 flex-wrap">
                {
                    product.sizes.map((size)=>(
                        <TouchableOpacity key={size} onPress={()=>setSelectedSize(size)}
                        className={`w-12 h-12 rounded-full items-center justify-center border ${selectedSize === size ? 'bg-primary dark:bg-white border-primary dark:border-white': 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                            <Text  className={`text-sm font-medium ${selectedSize === size ? 'text-white dark:text-primary': 'text-primary dark:text-gray-100'}`}>{size}</Text>
                          
                        </TouchableOpacity>
                    ))
                }

            </View>
            </>
          )}
          {/* Description */}
         <Text className="text-base font-bold text-primary dark:text-gray-100 mb-2">Description</Text>

         <Text className="text-secondary dark:text-gray-400 leading-6 mb-4">{product.description}</Text>
        </View>

      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 flex-row
      right-0 p-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <TouchableOpacity onPress={handleAddToCart} className="w-4/5 bg-primary dark:bg-white py-4 rounded-full items-center shadow-lg flex-row justify-center">
            <Ionicons name="bag-outline" size={20} color={isDark ? COLORS.primary : "white"} />
            <Text className="text-white dark:text-primary font-bold text-base ml-2">Add to Cart</Text>
        </TouchableOpacity>

         <TouchableOpacity onPress={()=> router.push("/(tabs)/cart")} className="w-1/5 py-3 flex-row justify-center relative">
            <Ionicons name="cart-outline" size={24} color={isDark ? 'white' : COLORS.primary} />
            <View className="absolute top-2 right-4 size-4 z-10 bg-black dark:bg-gray-800 rounded-full justify-center items-center">
                 <Text className="text-white text-[9px]">{itemCount}</Text>
            </View>
           
        </TouchableOpacity>
      </View>
    </View>
  );
}