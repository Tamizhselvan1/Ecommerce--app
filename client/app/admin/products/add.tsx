import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Switch, Image, ActivityIndicator, Modal, FlatList, TouchableWithoutFeedback, Platform, } from "react-native";
import Toast from 'react-native-toast-message';
import { COLORS } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CATEGORIES } from "@/constants";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import api from "@/constants/api";
import { useColorScheme } from "nativewind";

export default function AddProduct() {

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter()
    const {getToken} = useAuth();
    

    const [submitting, setSubmitting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("Men");
    const [sizes, setSizes] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isFeatured, setIsFeatured] = useState(false);

    // PICK MULTIPLE IMAGES (MAX 5)
    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((asset) => asset.uri);
            setImages(uris.slice(0, 5));
        }
    };

    // Add Product
    const handleSubmit = async () => {
        if (!name || !price || !category || sizes.length < 1) {
            Toast.show({
                type: 'error',
                text1: 'Missing Fields',
                text2: 'Please fill in all required fields'
            });
            return;
        }
        try {
            setSubmitting(true);
            const token = await getToken();
            const fromData = new FormData();
            
            //Basic fields
            const fields ={
                name,description,price,
                stock: stock || '0',
                category,
                isFeatured: String(isFeatured),
                sizes
            }
            Object.entries(fields).forEach(([key, value]) => fromData.append(key, value))

            //Images
            for (const [i, uri] of images.entries()){
                const filename= `images-${i}.jpg`;
                fromData.append("images",{uri, name: filename, type: 'image/jpeg'} as any)
            }

            const {data} = await api.post('/products', fromData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })

            if(!data?.success) throw new Error("upload failed")

                Toast.show({
                    type:'success',
                    text1: 'success',
                    text2: 'Product created'
                })
                router.replace('/admin/products')

        } catch (error:any) {
            console.error(error);
            Toast.show({
                    type:'error',
                    text1: 'Failed to Create Product',
                    text2: error.response?.data?.message || 'Something went wrong'
                })
        }finally{
            setSubmitting(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-surface dark:bg-gray-900 p-4">
            <View className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm mb-20">
                {/* NAME */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Product Name *
                </Text>
                <TextInput
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-4 text-primary dark:text-white"
                    style={{ outlineStyle: 'none' } as any}
                    placeholder="e.g. Wireless Headphones"
                    value={name}
                    onChangeText={setName}
                />

                {/* PRICE */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Price ($) *
                </Text>
                <TextInput
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-4 text-primary dark:text-white"
                    style={{ outlineStyle: 'none' } as any}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={price}
                    onChangeText={setPrice}
                />

                {/* CATEGORY */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Category
                </Text>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-4 flex-row justify-between items-center"
                >
                    <Text className="text-primary dark:text-white">{category}</Text>
                    <Ionicons name="chevron-down" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                </TouchableOpacity>

                {/* CATEGORY MODAL */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[50%]">
                                <Text className="text-lg font-bold text-center mb-4 dark:text-white">
                                    Select Category
                                </Text>

                                <FlatList
                                    data={CATEGORIES}
                                    keyExtractor={(item) => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            className={`p-4 border-b dark:border-gray-800 ${category === item.name ? "bg-primary/5" : ""
                                                }`}
                                            onPress={() => {
                                                setCategory(item.name);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <View className="flex-row justify-between">
                                                <Text
                                                    className={`dark:text-white ${category === item.name ? "font-bold text-primary dark:text-white" : ""
                                                        }`}
                                                >
                                                    {item.name}
                                                </Text>
                                                {category === item.name && (
                                                    <Ionicons
                                                        name="checkmark"
                                                        size={20}
                                                        color={isDark ? '#e5e7eb' : COLORS.primary}
                                                    />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                {/* STOCK */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Stock Level
                </Text>
                <TextInput
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-4 text-primary dark:text-white"
                    style={{ outlineStyle: 'none' } as any}
                    placeholder="0"
                    keyboardType="number-pad"
                    value={stock}
                    onChangeText={setStock}
                />

                {/* SIZES */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Sizes (comma separated)
                </Text>
                <TextInput
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-4 text-primary dark:text-white"
                    style={{ outlineStyle: 'none' } as any}
                    placeholder="e.g. S, M, L, XL"
                    value={sizes}
                    onChangeText={setSizes}
                />

                {/* IMAGE PICKER */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Product Images (max 5)
                </Text>

                <TouchableOpacity onPress={pickImages} className="mb-4">
                    {images.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {images.map((uri, i) => (
                                <Image
                                    key={i}
                                    source={{ uri }}
                                    className="w-32 h-32 rounded-lg mr-2"
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View className="w-full h-32 rounded-lg bg-gray-100 dark:bg-gray-800 justify-center items-center border border-dashed border-gray-300 dark:border-gray-700">
                            <Ionicons
                                name="cloud-upload-outline"
                                size={32}
                                color={isDark ? '#9ca3af' : COLORS.secondary}
                            />
                            <Text className="text-secondary dark:text-gray-400 text-xs mt-2">
                                Tap to upload images
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* DESCRIPTION */}
                <Text className="text-secondary dark:text-gray-400 text-xs font-bold mb-1 uppercase">
                    Description
                </Text>
                <TextInput
                    className="bg-surface dark:bg-gray-900 p-3 rounded-lg mb-6 text-primary dark:text-white h-24"
                    style={{ outlineStyle: 'none' } as any}
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />

                {/* FEATURED */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-primary dark:text-white font-bold">Featured Product</Text>
                    <Switch
                        value={isFeatured}
                        onValueChange={setIsFeatured}
                        trackColor={{ false: "#eee", true: COLORS.primary }}
                    />
                </View>

                {/* SUBMIT */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    className={`bg-primary dark:bg-indigo-600 p-4 rounded-xl items-center shadow-sm ${submitting ? "opacity-70" : ""
                        }`}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            Create Product
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
