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

import { Product } from "@/constants/types";
import { COLORS } from "@/constants";
import api from "@/constants/api";
import { useColorScheme } from "nativewind";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fetch Products
  const fetchProducts = async (pageNumber: number, currentSearchQuery = searchQuery) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await api.get("/products", {
        params: {
          page: pageNumber,
          limit: 10,
          search: currentSearchQuery || undefined,
        },
      });

      if (response.data.success) {
        const fetchedProducts = response.data.data;
        const pagination = response.data.pagination;

        if (pageNumber === 1) {
          setProducts(fetchedProducts);
        } else {
          setProducts((prev) => [...prev, ...fetchedProducts]);
        }

        setHasMore(pagination.page < pagination.pages);
        setPage(pageNumber);
      }
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
      fetchProducts(page + 1, searchQuery);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={["top"]}>
      {/* Header */}
      <Header title="Shop" showBack showCart />

      {/* Search Bar */}
      <View className="flex-row items-center mx-4 my-2">
        <View className="flex-1 flex-row items-center bg-[#efefef] dark:bg-[#262626] rounded-xl px-3 h-10">
          <Ionicons
            name="search"
            size={18}
            color="#8e8e8e"
          />

          <TextInput
            className="flex-1 ml-3 text-primary dark:text-white text-[15px]"
            placeholder="Search"
            placeholderTextColor="#8e8e8e"
            returnKeyType="search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ 
              paddingVertical: 0, 
              outlineStyle: 'none',
              color: isDark ? '#FFFFFF' : '#111111'
            } as any}
          />
          
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
              <Ionicons name="close-circle" size={16} color="#8e8e8e" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity className="ml-3 p-1">
          <Ionicons
            name="options-outline"
            size={26}
            color={isDark ? 'white' : 'black'}
          />
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            size="large"
            color={isDark ? '#FFF' : COLORS.primary}
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
                color={isDark ? '#FFF' : COLORS.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-primary dark:text-gray-100">No products found.</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}