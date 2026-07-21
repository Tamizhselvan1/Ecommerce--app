import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { BANNERS } from "@/assets/assets";
import { useRouter } from "expo-router";
import { CATEGORIES } from "@/constants";
import CategoryItem from "@/components/CategoryItem";
import { Product } from "@/constants/types";
import ProductCard from "@/components/ProductCard";
import api from "@/constants/api";
import { useColorScheme } from "nativewind";

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const bannerRef = useRef<ScrollView>(null);

  const categories = [
    { id: "all", name: "All", icon: "grid" },
    ...CATEGORIES,
  ];

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
  const interval = setInterval(() => {
    const nextIndex =
      activeBannerIndex === BANNERS.length - 1
        ? 0
        : activeBannerIndex + 1;

    bannerRef.current?.scrollTo({
      x: nextIndex * (width - 32),
      animated: true,
    });

    setActiveBannerIndex(nextIndex);
  }, 3000); // Auto scroll every 3 seconds

  return () => clearInterval(interval);
   }, [activeBannerIndex]);

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={["top"]}>
      <Header title="Forever" showMenu showCart showLogo />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Slider */}
        <View className="mb-6">
          <ScrollView
          ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="w-full h-48 rounded-xl"
            scrollEventThrottle={16}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width
              );

              if (slide !== activeBannerIndex) {
                setActiveBannerIndex(slide);
              }
            }}
          >
            {BANNERS.map((banner, index) => (
              <View
                key={index}
                className="relative h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-xl"
                style={{ width: width - 32 }}
              >
                <Image
                  source={{ uri: banner.image }}
                  className="h-full w-full"
                  resizeMode="cover"
                />

                {/* Dark Overlay */}
                <View className="absolute inset-0 bg-black/40" />

                {/* Banner Content */}
                <View className="absolute bottom-4 left-4 z-10">
                  <Text className="text-white text-2xl font-bold">
                    {banner.title}
                  </Text>

                  <Text className="text-white text-sm font-medium">
                    {banner.subtitle}
                  </Text>

                  <TouchableOpacity className="mt-2 bg-white px-4 py-2 rounded-full self-start">
                    <Text className="text-primary font-bold text-xs">
                      Get Now
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View className="flex-row justify-center mt-3 gap-2">
            {BANNERS.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === activeBannerIndex
                    ? "w-6 bg-primary dark:bg-white"
                    : "w-2 bg-gray-300 dark:bg-gray-700"
                }`}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary dark:text-gray-100">
              Categories
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((cat: any) => (
              <CategoryItem
                key={cat.id}
                item={cat}
                isSelected={false}
                onPress={() =>
                  router.push({
                    pathname: "/shop",
                    params: {
                      category: cat.id === "all" ? "" : cat.name,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        </View>

        {/* Popular Products */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-primary dark:text-gray-100">
              Popular
            </Text>

            <TouchableOpacity onPress={() => router.push("/shop")}>
              <Text className="text-secondary dark:text-gray-400 text-sm">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Products will be displayed here */}
          {loading ? (
            <ActivityIndicator size='large' color={isDark ? '#FFF' : '#000'} />
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.slice(0,4).map((product)=>(
                <ProductCard key={product._id} product={product} />
              ))}
            </View>
           
          )}
        </View>

        {/* Newsletter CTA */}
        <View className="bg-gray-100 dark:bg-gray-900 border border-transparent dark:border-gray-800 p-6 rounded-2xl mb-20 items-center">
          <Text className="text-2xl font-bold text-primary dark:text-gray-100">Join the Revolution</Text>
          <Text className="text-secondary dark:text-gray-400 text-center mb-4">Subscribe to our newsletter and get 10% off your first purchase.</Text>
          <TouchableOpacity className="bg-primary dark:bg-white w-4/5 py-3 rounded-full items-center">
            <Text className="text-white dark:text-primary font-medium text-base">Subscribe Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}