import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
      <Header title="Privacy Policy" showBack />
      <ScrollView className="flex-1 px-5 mt-4" showsVerticalScrollIndicator={false}>
        
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-10 border border-gray-100 dark:border-gray-800">
          <Text className="text-2xl font-bold text-primary dark:text-gray-100 mb-6">Privacy Policy</Text>
          <Text className="text-secondary dark:text-gray-400 mb-8 leading-relaxed">
            Last updated: October 2026. This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">1. Information Collection</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            We collect several different types of information for various purposes to provide and improve our Service to you. This includes Personal Data (such as email address, first name and last name, phone number) and Usage Data.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">2. Use of Data</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            We use the collected data for various purposes, including to provide and maintain our Service, to notify you about changes to our Service, to provide customer support, and to gather analysis or valuable information so that we can improve our Service.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">3. Data Security</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">4. Your Rights</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            You have the right to request a copy of your information, to object to our use of your information, and to request the deletion of your information. You can manage most of this directly from your Profile settings.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">5. Contact Us</Text>
          <Text className="text-secondary dark:text-gray-400 mb-2 leading-relaxed">
            If you have any questions about this Privacy Policy, You can contact us:
          </Text>
          <Text className="text-primary dark:text-gray-200 font-medium mb-6">
            • By email: support@ecommerce-app.com
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
