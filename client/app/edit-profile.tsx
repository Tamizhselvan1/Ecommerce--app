import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import Header from '@/components/Header';
import { COLORS } from '@/constants';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';

export default function EditProfile() {
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryPhone = user?.phoneNumbers?.find(p => p.id === user.primaryPhoneNumberId);
  const primaryEmail = user?.emailAddresses?.find(e => e.id === user.primaryEmailAddressId);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(primaryPhone?.phoneNumber || '');
  
  const [profileImage, setProfileImage] = useState(user?.imageUrl || null);
  
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingPhoneNumberObj, setPendingPhoneNumberObj] = useState<any>(null);

  const isPhoneUnverified = primaryPhone && primaryPhone.verification.status !== 'verified';
  const hasPhoneChanged = phone !== (primaryPhone?.phoneNumber || '');

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfileImage(uri);
        await uploadImage(uri);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to pick image' });
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setImageUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      await user?.setProfileImage({ file: blob });
      Toast.show({ type: 'success', text1: 'Image Updated', text2: 'Your profile picture has been updated' });
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Upload Failed', text2: error.message || 'Could not upload image' });
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'First and last names are required' });
      return;
    }

    try {
      setSaving(true);
      await user?.update({ firstName, lastName });

      // Handle Phone Number update
      if (hasPhoneChanged && phone) {
        // If a number already exists, Clerk might require handling old numbers. 
        // For simplicity, we just add the new phone number.
        const newPhoneObj = await user?.createPhoneNumber({ phoneNumber: phone });
        
        if (newPhoneObj) {
            await newPhoneObj.prepareVerification();
            setPendingPhoneNumberObj(newPhoneObj);
            setShowOtpModal(true);
            Toast.show({ type: 'info', text1: 'OTP Sent', text2: 'Please verify your new phone number' });
            setSaving(false);
            return; // Wait for OTP
        }
      }

      Toast.show({ type: 'success', text1: 'Success', text2: 'Profile updated successfully' });
      router.back();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Failed to update profile', text2: error?.errors?.[0]?.message || error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || !pendingPhoneNumberObj) return;
    try {
        setOtpLoading(true);
        const attempt = await pendingPhoneNumberObj.attemptVerification({ code: otpCode });
        if (attempt.verification.status === 'verified') {
            await user?.update({ primaryPhoneNumberId: attempt.id });
            setShowOtpModal(false);
            Toast.show({ type: 'success', text1: 'Verified!', text2: 'Phone number verified successfully.' });
            router.back();
        }
    } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Verification Failed', text2: error?.errors?.[0]?.message || error.message });
    } finally {
        setOtpLoading(false);
    }
  };

  const handleVerifyExistingPhone = async () => {
      if (!primaryPhone) return;
      try {
          setSaving(true);
          await primaryPhone.prepareVerification();
          setPendingPhoneNumberObj(primaryPhone);
          setShowOtpModal(true);
          Toast.show({ type: 'info', text1: 'OTP Sent', text2: 'Please check your phone for the code.' });
      } catch (err: any) {
          Toast.show({ type: 'error', text1: 'Failed to send OTP', text2: err?.errors?.[0]?.message || err.message });
      } finally {
          setSaving(false);
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-900" edges={['top']}>
      <Header title="Edit Profile" showBack />
      
      <ScrollView className="flex-1 px-4 mt-2">
        {/* Avatar Section */}
        <View className="items-center mb-8 mt-4">
          <TouchableOpacity onPress={pickImage} className="relative" disabled={imageUploading}>
            <View className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 justify-center items-center">
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <Ionicons name="person" size={40} color={isDark ? '#9ca3af' : COLORS.secondary} />
              )}
              {imageUploading && (
                <View className="absolute inset-0 bg-black/40 justify-center items-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full justify-center items-center border-2 border-white shadow-sm">
              <Ionicons name="camera" size={14} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Section */}
        <View className="bg-white dark:bg-gray-950 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          
          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2 ml-1 tracking-wider">First Name</Text>
          <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl mb-5 border border-transparent focus:border-gray-200">
            <Ionicons name="person-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
            <TextInput
              className="flex-1 text-primary dark:text-white text-base ml-2 font-medium"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              style={{ outlineStyle: 'none' } as any}
            />
          </View>

          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2 ml-1 tracking-wider">Last Name</Text>
          <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl mb-5 border border-transparent focus:border-gray-200">
            <Ionicons name="person-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
            <TextInput
              className="flex-1 text-primary dark:text-white text-base ml-2 font-medium"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              style={{ outlineStyle: 'none' } as any}
            />
          </View>

          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2 ml-1 tracking-wider">Phone Number</Text>
          <View className="flex-row items-center bg-surface dark:bg-gray-900 p-4 rounded-xl mb-2 border border-transparent focus:border-gray-200">
            <Ionicons name="call-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
            <TextInput
              className="flex-1 text-primary dark:text-white text-base ml-2 font-medium"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              style={{ outlineStyle: 'none' } as any}
            />
            {(!hasPhoneChanged && phone && !isPhoneUnverified) && (
                 <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            )}
          </View>
          
          {isPhoneUnverified && !hasPhoneChanged && (
              <View className="flex-row items-center justify-between bg-orange-50 p-3 rounded-lg mb-4 border border-orange-100">
                  <View className="flex-row items-center">
                    <Ionicons name="warning" size={16} color="#f59e0b" className="mr-2" />
                    <Text className="text-orange-700 text-xs font-medium">Number unverified</Text>
                  </View>
                  <TouchableOpacity onPress={handleVerifyExistingPhone} className="bg-orange-500 px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-bold">Verify Now</Text>
                  </TouchableOpacity>
              </View>
          )}
          {hasPhoneChanged && (
              <Text className="text-xs text-gray-400 ml-1 mb-4">You will be asked to verify this number via SMS OTP when you save.</Text>
          )}

          <Text className="text-secondary dark:text-gray-400 font-bold text-xs uppercase mb-2 ml-1 tracking-wider mt-2">Email Address</Text>
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6 opacity-80">
            <Ionicons name="mail-outline" size={20} color={isDark ? '#9ca3af' : COLORS.secondary} className="mr-3" />
            <TextInput
              className="flex-1 text-gray-500 text-base ml-2 font-medium"
              value={primaryEmail?.emailAddress || ''}
              editable={false}
              style={{ outlineStyle: 'none' } as any}
            />
            {primaryEmail?.verification.status === 'verified' ? (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            ) : (
                <Ionicons name="lock-closed-outline" size={16} color={isDark ? '#9ca3af' : COLORS.secondary} />
            )}
          </View>

          <TouchableOpacity 
            className={`p-4 rounded-xl items-center flex-row justify-center shadow-sm ${saving ? 'bg-primary/70 dark:bg-indigo-600/70' : 'bg-primary dark:bg-indigo-600'}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" className="mr-2" />
            ) : null}
            <Text className="text-white font-bold text-lg">Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} animationType="slide" transparent={true}>
          <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white dark:bg-gray-950 rounded-t-3xl p-6 h-2/3">
                  <View className="items-center mb-6">
                      <View className="w-12 h-1.5 bg-gray-300 rounded-full mb-6" />
                      <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-4 shadow-sm">
                          <Ionicons name="chatbubble-ellipses" size={32} color="white" />
                      </View>
                      <Text className="text-2xl font-bold text-primary dark:text-white mb-2 text-center">Verify Phone Number</Text>
                      <Text className="text-secondary dark:text-gray-400 text-center">Enter the code we just sent via SMS</Text>
                  </View>

                  <View className="mb-6">
                    <TextInput
                        className="w-full bg-surface dark:bg-gray-900 p-4 rounded-xl text-primary dark:text-white text-center tracking-widest font-bold text-xl"
                        placeholder="123456"
                        placeholderTextColor="#999"
                        keyboardType="number-pad"
                        value={otpCode}
                        onChangeText={setOtpCode}
                        style={{ outlineStyle: 'none' } as any}
                    />
                  </View>

                  <TouchableOpacity 
                    className={`w-full py-4 rounded-xl items-center mb-4 shadow-sm flex-row justify-center ${otpLoading || !otpCode ? 'bg-primary/70' : 'bg-primary'}`}
                    onPress={handleVerifyOtp}
                    disabled={otpLoading || !otpCode}
                  >
                      {otpLoading && <ActivityIndicator color="white" className="mr-2" />}
                      <Text className="text-white font-bold text-lg">Verify & Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setShowOtpModal(false)} className="items-center py-4">
                      <Text className="text-secondary dark:text-gray-400 font-bold">Cancel</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
}
