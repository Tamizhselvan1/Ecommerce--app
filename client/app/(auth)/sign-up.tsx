import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useColorScheme } from "nativewind";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpPage() {
    const { signUp, setActive, isLoaded } = useSignUp();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Google OAuth
    const onGooglePress = async () => {
        try {
            setLoading(true);
            const { createdSessionId, setActive: setOAuthActive } = await startGoogleOAuth();
            if (createdSessionId && setOAuthActive) {
                await setOAuthActive({ session: createdSessionId });
                router.replace("/");
            }
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Google Sign Up Failed", text2: err.errors?.[0]?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    // Standard Sign Up
    const onSignUpPress = async () => {
        if (!isLoaded || !emailOrPhone || !password) return;
        setLoading(true);
        try {
            const isEmail = emailOrPhone.includes("@");
            
            await signUp.create({
                ...(isEmail ? { emailAddress: emailOrPhone } : { phoneNumber: emailOrPhone }),
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: isEmail ? "email_code" : "phone_code" as any });
            
            setPendingVerification(true);
            Toast.show({ type: "success", text1: "Code Sent", text2: "Check your email/phone for the verification code." });
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Sign Up Failed", text2: err.errors?.[0]?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP
    const onVerifyPress = async () => {
        if (!isLoaded || !code) return;
        setLoading(true);
        try {
            const isEmail = emailOrPhone.includes("@");
            const attempt = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                Toast.show({ type: "success", text1: "Welcome!", text2: "Your account has been created successfully." });
                router.replace("/");
            } else {
                Toast.show({ type: "error", text1: "Verification Failed", text2: "Invalid verification code." });
            }
        } catch (err: any) {
            // Note: Since Clerk typings only expose attemptEmailAddressVerification easily, 
            // if it's a phone, we should use attemptPhoneNumberVerification. Let's use generic error handling.
            try {
                const attemptPhone = await signUp.attemptPhoneNumberVerification({ code });
                if (attemptPhone.status === "complete") {
                    await setActive({ session: attemptPhone.createdSessionId });
                    Toast.show({ type: "success", text1: "Welcome!", text2: "Your account has been created successfully." });
                    router.replace("/");
                    return;
                }
            } catch (phoneErr: any) {
                 Toast.show({ type: "error", text1: "Verification Failed", text2: err.errors?.[0]?.message || err.message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 28, justifyContent: "center" }}>
                    
                    <TouchableOpacity onPress={() => router.push("/")} className="absolute top-12 left-6 z-10 w-10 h-10 bg-gray-50 dark:bg-gray-900 rounded-full items-center justify-center">
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#e5e7eb' : COLORS.primary} />
                    </TouchableOpacity>

                    {!pendingVerification ? (
                        <>
                            <View className="items-center mb-10 mt-12">
                                <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
                                    <Ionicons name="person-add" size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-primary dark:text-white mb-2 tracking-tight">Create Account</Text>
                                <Text className="text-secondary dark:text-gray-400 text-base">Sign up to get started</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Email or Phone Number</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="mail-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Enter email or phone" 
                                        placeholderTextColor="#999" 
                                        autoCapitalize="none" 
                                        value={emailOrPhone} 
                                        onChangeText={setEmailOrPhone} 
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Password</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Create a password" 
                                        placeholderTextColor="#999" 
                                        secureTextEntry={!showPassword} 
                                        value={password} 
                                        onChangeText={setPassword} 
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center mb-6 shadow-sm flex-row justify-center ${loading || !emailOrPhone || !password ? "bg-primary/70" : "bg-primary"}`} 
                                onPress={onSignUpPress} 
                                disabled={loading || !emailOrPhone || !password}
                            >
                                {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                                <Text className="text-white font-bold text-lg">Sign Up</Text>
                            </TouchableOpacity>

                            <View className="flex-row items-center mb-6">
                                <View className="flex-1 h-[1px] bg-gray-200" />
                                <Text className="text-gray-400 mx-4 font-medium">OR</Text>
                                <View className="flex-1 h-[1px] bg-gray-200" />
                            </View>

                            <TouchableOpacity 
                                className="w-full bg-white dark:bg-gray-950 border border-gray-200 py-4 rounded-xl items-center mb-10 flex-row justify-center shadow-sm"
                                onPress={onGooglePress}
                                disabled={loading}
                            >
                                <Ionicons name="logo-google" size={20} color="#DB4437" className="mr-3" />
                                <Text className="text-primary dark:text-white font-bold text-lg ml-2">Sign up with Google</Text>
                            </TouchableOpacity>

                            <View className="flex-row justify-center">
                                <Text className="text-secondary dark:text-gray-400 font-medium">Already have an account? </Text>
                                <Link href="/sign-in">
                                    <Text className="text-primary dark:text-white font-bold">Sign in</Text>
                                </Link>
                            </View>
                        </>
                    ) : (
                        <>
                            <View className="items-center mb-10 mt-12">
                                <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
                                    <Ionicons name="mail-open" size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-primary dark:text-white mb-2 tracking-tight">Verify Account</Text>
                                <Text className="text-secondary dark:text-gray-400 text-base text-center">Enter the code sent to {emailOrPhone}</Text>
                            </View>

                            <View className="mb-8">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Verification Code</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="keypad-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium tracking-widest text-center" 
                                        placeholder="123456" 
                                        placeholderTextColor="#999" 
                                        keyboardType="number-pad"
                                        value={code} 
                                        onChangeText={setCode} 
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center mb-6 shadow-sm flex-row justify-center ${loading || !code ? "bg-primary/70" : "bg-primary"}`} 
                                onPress={onVerifyPress} 
                                disabled={loading || !code}
                            >
                                {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                                <Text className="text-white font-bold text-lg">Verify & Complete</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setPendingVerification(false)} className="items-center py-4">
                                <Text className="text-secondary dark:text-gray-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
