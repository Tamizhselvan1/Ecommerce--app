import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

import { dummyProducts } from "@/assets/assets";
import { Product } from "@/constants/types";
import { COLORS } from "@/constants";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch Products
  const fetchProducts = async (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const start = (pageNumber - 1) * 10;
      const end = start + 10;

      const paginatedData = dummyProducts.slice(start, end);

      if (pageNumber === 1) {
        setProducts(paginatedData);
      } else {
        setProducts((prev) => [...prev, ...paginatedData]);
      }

      setHasMore(end < dummyProducts.length);
      setPage(pageNumber);
    } catch (error) {
      console.error("Pagination Error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load More Products
  const loadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      fetchProducts(page + 1);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <Header title="Shop" showBack showCart />

      {/* Search Bar */}
      <View className="flex-row items-center gap-2 mx-4 my-3">
        <View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-200 px-3">
          <Ionicons
            name="search"
            size={20}
            color={COLORS.secondary}
          />

          <TextInput
            className="flex-1 ml-2 py-3 text-primary"
            placeholder="Search products..."
            placeholderTextColor="#999"
            returnKeyType="search"
          />
        </View>

        {/* Filter Button */}
        <TouchableOpacity className="w-12 h-12 bg-gray-800 rounded-xl items-center justify-center">
          <Ionicons
            name="options-outline"
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item._id)}
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard product={item} />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 100,
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 16,
          }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text>No products found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}