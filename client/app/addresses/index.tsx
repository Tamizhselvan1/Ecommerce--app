import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Modal, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { COLORS } from "@/constants";
import type { Address } from "@/constants/types";
import api from "@/constants/api";
import { useAuth } from "@clerk/clerk-expo";
import Toast from "react-native-toast-message";
import { useColorScheme } from "nativewind";

export default function Addresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form state
    const [type, setType] = useState("Home");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [country, setCountry] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
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

    useEffect(() => {
        if(isLoaded && isSignedIn){
            fetchAddresses();
        }
    }, [isLoaded, isSignedIn]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const config = await getHeaders();
            const response = await api.get('/addresses', config);
            if(response.data.success){
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSearch = (item: Address) => {
        setIsEditing(true);
        setEditingId(item._id);
        setType(item.type);
        setStreet(item.street);
        setCity(item.city);
        setState(item.state);
        setZipCode(item.zipCode);
        setCountry(item.country);
        setIsDefault(item.isDefault);
        setModalVisible(true);
    };

    const handleSaveAddress = async () => {
        if(!street || !city || !state || !zipCode || !country){
            Toast.show({type: 'error', text1: 'Please fill all fields'});
            return;
        }
        
        try {
            setSubmitting(true);
            const config = await getHeaders();
            const addressData = { type, street, city, state, zipCode, country, isDefault };
            
            if(isEditing && editingId){
                await api.put(`/addresses/${editingId}`, addressData, config);
            } else {
                await api.post('/addresses', addressData, config);
            }
            
            setModalVisible(false);
            resetForm();
            await fetchAddresses();
            Toast.show({type: 'success', text1: isEditing ? 'Address updated' : 'Address added'});
        } catch (error) {
            console.log("Error saving address", error);
            Toast.show({type: 'error', text1: 'Error saving address'});
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        try {
            const config = await getHeaders();
            await api.delete(`/addresses/${id}`, config);
            await fetchAddresses();
            Toast.show({type: 'success', text1: 'Address deleted'});
        } catch (error) {
            console.log("Error deleting address", error);
            Toast.show({type: 'error', text1: 'Error deleting address'});
        }
    };

    const resetForm = () => {
        setStreet("");
        setCity("");
        setState("");
        setZipCode("");
        setCountry("");
        setType("Home");
        setIsDefault(false);
        setIsEditing(false);
        setEditingId(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
            <Header title="Shipping Addresses" showBack />

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={isDark ? '#FFF' : COLORS.primary} />
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4">
                    {addresses.length === 0 ? (
                        <Text className="text-center text-secondary dark:text-gray-400 mt-10">No addresses found</Text>
                    ) : (
                        addresses.map((item) => (
                            <View key={item._id} className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 shadow-sm border border-transparent dark:border-gray-800">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name={item.type === "Home" ? "home-outline" : "briefcase-outline"}
                                            size={20}
                                            color={isDark ? '#FFF' : COLORS.primary}
                                        />
                                        <Text className="text-base font-bold text-primary dark:text-white ml-2">{item.type}</Text>
                                        {item.isDefault && (
                                            <View className="bg-primary/10 dark:bg-white/10 px-2 py-1 rounded ml-2">
                                                <Text className="text-primary dark:text-white text-xs font-bold">Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-row items-center gap-4">
                                        <TouchableOpacity onPress={() => handleEditSearch(item)}>
                                            <Ionicons name="pencil-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteAddress(item._id)}>
                                            <Ionicons name="trash-outline" size={20} color={COLORS.error || '#ff4444'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text className="text-secondary dark:text-gray-400 leading-5 ml-7">
                                    {item.street}, {item.city}, {item.state} {item.zipCode}, {item.country}
                                </Text>
                            </View>
                        ))
                    )}

                    <TouchableOpacity className="flex-row items-center justify-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl mt-2 mb-8" onPress={openAddModal}>
                        <Ionicons name="add" size={24} color={isDark ? '#9ca3af' : COLORS.secondary} />
                        <Text className="text-secondary dark:text-gray-400 font-medium ml-2">Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Add Address Modal */}
            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-gray-950 rounded-t-3xl p-6 h-[85%] border-t border-gray-100 dark:border-gray-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-primary dark:text-white">{isEditing ? "Edit Address" : "Add New Address"}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={isDark ? '#FFF' : COLORS.primary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-primary dark:text-gray-300 font-medium mb-2">Label</Text>
                            <View className="flex-row gap-3 mb-4">
                                {["Home", "Work", "Other"].map((t) => (
                                    <TouchableOpacity key={t} onPress={() => setType(t)} className={`px-4 py-2 rounded-full border ${type === t ? 'bg-primary dark:bg-white border-primary dark:border-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'}`}>
                                        <Text className={type === t ? 'text-white dark:text-primary font-bold' : 'text-primary dark:text-gray-400'}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-primary dark:text-gray-300 font-medium mb-2">Street Address</Text>
                            <TextInput placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'} className="bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white mb-4 border border-transparent dark:border-gray-800" placeholder="123 Main St" value={street} onChangeText={setStreet} />

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="text-primary dark:text-gray-300 font-medium mb-2">City</Text>
                                    <TextInput placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'} className="bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white border border-transparent dark:border-gray-800" placeholder="New York" value={city} onChangeText={setCity} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary dark:text-gray-300 font-medium mb-2">State</Text>
                                    <TextInput placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'} className="bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white border border-transparent dark:border-gray-800" placeholder="NY" value={state} onChangeText={setState} />
                                </View>
                            </View>

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="text-primary dark:text-gray-300 font-medium mb-2">Zip Code</Text>
                                    <TextInput placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'} className="bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white border border-transparent dark:border-gray-800" placeholder="10001" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary dark:text-gray-300 font-medium mb-2">Country</Text>
                                    <TextInput placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'} className="bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white border border-transparent dark:border-gray-800" placeholder="USA" value={country} onChangeText={setCountry} />
                                </View>
                            </View>

                            <TouchableOpacity className="flex-row items-center mb-8" onPress={() => setIsDefault(!isDefault)}>
                                <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${isDefault ? 'bg-primary dark:bg-white border-primary dark:border-white' : 'border-gray-300 dark:border-gray-700'}`}>
                                    {isDefault && <Ionicons name="checkmark" size={14} color={isDark ? COLORS.primary : "white"} />}
                                </View>
                                <Text className="text-primary dark:text-gray-300">Set as default address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity className="w-full bg-primary dark:bg-white py-4 rounded-full items-center mb-10" onPress={handleSaveAddress} disabled={submitting} >
                                {submitting ? (
                                    <ActivityIndicator color={isDark ? COLORS.primary : "white"} />
                                ) : (
                                    <Text className="text-white dark:text-primary font-bold text-lg">Save Address</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
