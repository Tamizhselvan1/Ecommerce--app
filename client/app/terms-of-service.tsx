import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/Header';

export default function TermsOfService() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-gray-950" edges={['top']}>
      <Header title="Terms of Service" showBack />
      <ScrollView className="flex-1 px-5 mt-4" showsVerticalScrollIndicator={false}>
        
        <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm mb-10 border border-gray-100 dark:border-gray-800">
          <Text className="text-2xl font-bold text-primary dark:text-gray-100 mb-6">Terms of Service</Text>
          <Text className="text-secondary dark:text-gray-400 mb-8 leading-relaxed">
            Please read these Terms of Service carefully before using our mobile application. By accessing or using the Service, You agree to be bound by these Terms.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">1. User Accounts</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            When You create an account with us, You must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">2. Intellectual Property</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            The Service and its original content (excluding Content provided by You or other users), features and functionality are and will remain the exclusive property of the Company and its licensors.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">3. Prohibited Uses</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service in any way that violates any applicable national or international law or regulation.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">4. Limitation of Liability</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            In no event shall the Company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </Text>

          <Text className="text-lg font-bold text-primary dark:text-gray-100 mb-3">5. Changes to Terms</Text>
          <Text className="text-secondary dark:text-gray-400 mb-6 leading-relaxed">
            We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
