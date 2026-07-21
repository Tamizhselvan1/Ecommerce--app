import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import React from "react";
import { dummyUser } from "@/assets/assets";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, PROFILE_MENU } from "@/constants";
import { useColorScheme } from "nativewind";
import { useClerk } from "@clerk/clerk-expo";

export default function Profile() {
  const { user, signOut } = useClerk();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in")
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-900" edges={["top"]}>
      <Header title="Profile" />

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={
          !user
            ? {
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }
            : {
                paddingTop: 16,
              }
        }
      >
        {!user ? (
          <View className="items-center w-full">
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
              <Ionicons
                name="person"
                size={40}
                color={isDark ? '#9ca3af' : COLORS.secondary}
              />
            </View>

            <Text className="text-primary dark:text-white font-bold text-xl mb-2">
              Guest User
            </Text>

            <Text className="text-secondary dark:text-gray-400 text-base mb-8 text-center w-3/4 px-4">
              Login to view your profile, orders, and addresses.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              className="bg-primary w-3/5 py-3 rounded-full items-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">
                Login / Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
          {/* profile info */}
          <View className="items-center mb-8">
              <View className="mb-3">
              <Image source={{uri: user.imageUrl}} className="size-20 border-2 border-white shadow-sm rounded-full"/>
            </View>
            <Text className="text-xl font-bold dark:text-gray-100">{user.firstName + " "+ user.lastName}</Text>
            <Text className="text-secondary dark:text-gray-400 text-sm">{user.emailAddresses[0].emailAddress}</Text>

            {/* Admin panel Button if user if Admin */}
            {user.publicMetadata?.role === 'admin' && (
              <TouchableOpacity onPress={()=> router.push('/admin')} className="mt-4 bg-primary dark:bg-white px-6 py-2 rounded-full">
                <Text className="text-white dark:text-primary font-bold">Admin Panel</Text>
              </TouchableOpacity>
            )}
          </View>

            {/* Profile Completion Prompt */}
            {(!user.firstName || !user.lastName) && (
              <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 flex-row items-center">
                <View className="bg-orange-100 p-2 rounded-full mr-3">
                  <Ionicons name="alert-circle" size={24} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="text-orange-900 font-bold mb-1">Complete your profile</Text>
                  <Text className="text-orange-800 text-xs mb-2">Please add your first and last name to help us personalize your experience.</Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/edit-profile')}
                    className="bg-orange-500 self-start px-4 py-1.5 rounded-full"
                  >
                    <Text className="text-white font-bold text-xs">Update Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Menu */}
            <View className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800/75 p-2 mb-4">
              {PROFILE_MENU.map((item, index)=>(
                <TouchableOpacity key={item.id} className={`flex-row items-center p-4 ${index !== PROFILE_MENU.length -1 ? "border-b border-gray-100 dark:border-gray-800" : ''}`}
                onPress={()=> router.push(item.route as any)}>
                  <View className="w-10 h-10 bg-surface dark:bg-gray-900 rounded-full items-center justify-center mr-4">
                  <Ionicons name={item.icon as any} size={20} color={isDark ? '#e5e7eb' : COLORS.primary} />  
                  </View>
                  <Text className="flex-1 text-primary dark:text-white font-medium">{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? '#e5e7eb' : COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity className="flex-row items-center justify-center p-4" onPress={handleLogout}>
              <Text className="text-red-500 font-bold ml-2">LogOut</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}