import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants";
import { useColorScheme } from "nativewind";

WebBrowser.maybeCompleteAuthSession();

export default function SignInPage() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: "oauth_google" });
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [identifier, setIdentifier] = useState(""); // Can be email or phone
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    
    // UI State
    const [mode, setMode] = useState<"login" | "forgot_password" | "reset_password">("login");
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
            Toast.show({ type: "error", text1: "Google Sign In Failed", text2: err.errors?.[0]?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    // Standard Sign In
    const onSignInPress = async () => {
        if (!isLoaded || !identifier || !password) return;
        setLoading(true);
        try {
            const attempt = await signIn.create({
                identifier,
                password,
            });

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                router.replace("/");
            }
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Sign In Failed", text2: err.errors?.[0]?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password Flow - Step 1
    const onForgotPasswordPress = async () => {
        if (!isLoaded || !identifier) {
            Toast.show({ type: "error", text1: "Identifier Required", text2: "Please enter your email or phone number first." });
            return;
        }
        setLoading(true);
        try {
            const strategy = identifier.includes("@") ? "reset_password_email_code" : "reset_password_phone_code";
            await signIn.create({
                strategy,
                identifier,
            });
            setMode("reset_password");
            Toast.show({ type: "success", text1: "Code Sent", text2: "Check your email/phone for the reset code." });
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Failed to send code", text2: err.errors?.[0]?.message || err.message });
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password Flow - Step 2 (Reset)
    const onResetPasswordPress = async () => {
        if (!isLoaded || !code || !newPassword) return;
        setLoading(true);
        try {
            const strategy = identifier.includes("@") ? "reset_password_email_code" : "reset_password_phone_code";
            const attempt = await signIn.attemptFirstFactor({
                strategy,
                code,
                password: newPassword,
            });

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                Toast.show({ type: "success", text1: "Password Reset", text2: "Your password has been successfully changed!" });
                router.replace("/");
            }
        } catch (err: any) {
            Toast.show({ type: "error", text1: "Reset Failed", text2: err.errors?.[0]?.message || err.message });
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

                    {mode === "login" && (
                        <>
                            <View className="items-center mb-10 mt-12">
                                <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
                                    <Ionicons name="lock-closed" size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-primary dark:text-white mb-2 tracking-tight">Welcome Back</Text>
                                <Text className="text-secondary dark:text-gray-400 text-base">Sign in to your account</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Email or Phone Number</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="person-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Enter email or phone" 
                                        placeholderTextColor="#999" 
                                        autoCapitalize="none" 
                                        value={identifier} 
                                        onChangeText={setIdentifier} 
                                    />
                                </View>
                            </View>

                            <View className="mb-2">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Password</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="key-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Enter your password" 
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

                            <View className="items-end mb-8">
                                <TouchableOpacity onPress={() => setMode("forgot_password")}>
                                    <Text className="text-primary dark:text-white font-bold text-sm">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center mb-6 shadow-sm flex-row justify-center ${loading || !identifier || !password ? "bg-primary/70" : "bg-primary"}`} 
                                onPress={onSignInPress} 
                                disabled={loading || !identifier || !password}
                            >
                                {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                                <Text className="text-white font-bold text-lg">Sign In</Text>
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
                                <Text className="text-primary dark:text-white font-bold text-lg ml-2">Continue with Google</Text>
                            </TouchableOpacity>

                            <View className="flex-row justify-center">
                                <Text className="text-secondary dark:text-gray-400 font-medium">Don't have an account? </Text>
                                <Link href="/sign-up">
                                    <Text className="text-primary dark:text-white font-bold">Sign up</Text>
                                </Link>
                            </View>
                        </>
                    )}

                    {mode === "forgot_password" && (
                        <>
                            <View className="items-center mb-10 mt-12">
                                <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
                                    <Ionicons name="key" size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-primary dark:text-white mb-2 tracking-tight">Reset Password</Text>
                                <Text className="text-secondary dark:text-gray-400 text-base text-center">Enter your email or phone number to receive a reset code.</Text>
                            </View>

                            <View className="mb-8">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Email or Phone Number</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="mail-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Enter email or phone" 
                                        placeholderTextColor="#999" 
                                        autoCapitalize="none" 
                                        value={identifier} 
                                        onChangeText={setIdentifier} 
                                    />
                                </View>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center mb-6 shadow-sm flex-row justify-center ${loading || !identifier ? "bg-primary/70" : "bg-primary"}`} 
                                onPress={onForgotPasswordPress} 
                                disabled={loading || !identifier}
                            >
                                {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                                <Text className="text-white font-bold text-lg">Send Reset Code</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setMode("login")} className="items-center py-4">
                                <Text className="text-secondary dark:text-gray-400 font-bold">Back to Login</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {mode === "reset_password" && (
                        <>
                            <View className="items-center mb-10 mt-12">
                                <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-sm">
                                    <Ionicons name="shield-checkmark" size={32} color="white" />
                                </View>
                                <Text className="text-3xl font-bold text-primary dark:text-white mb-2 tracking-tight">Set New Password</Text>
                                <Text className="text-secondary dark:text-gray-400 text-base text-center">Enter the code sent to {identifier} and choose a new password.</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">Verification Code</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="keypad-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium tracking-widest" 
                                        placeholder="123456" 
                                        placeholderTextColor="#999" 
                                        keyboardType="number-pad"
                                        value={code} 
                                        onChangeText={setCode} 
                                    />
                                </View>
                            </View>

                            <View className="mb-8">
                                <Text className="text-primary dark:text-white font-medium text-xs uppercase mb-2 ml-1">New Password</Text>
                                <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
                                    <TextInput 
                                        className="flex-1 text-primary dark:text-white text-base font-medium" 
                                        placeholder="Enter new password" 
                                        placeholderTextColor="#999" 
                                        secureTextEntry={!showPassword} 
                                        value={newPassword} 
                                        onChangeText={setNewPassword} 
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={isDark ? '#9ca3af' : COLORS.secondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity 
                                className={`w-full py-4 rounded-xl items-center mb-6 shadow-sm flex-row justify-center ${loading || !code || !newPassword ? "bg-primary/70" : "bg-primary"}`} 
                                onPress={onResetPasswordPress} 
                                disabled={loading || !code || !newPassword}
                            >
                                {loading && <ActivityIndicator color="#fff" className="mr-2" />}
                                <Text className="text-white font-bold text-lg">Change Password</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setMode("login")} className="items-center py-4">
                                <Text className="text-secondary dark:text-gray-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
