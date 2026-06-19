import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView className="flex-1 bg-black">
        <StatusBar style="light" />

        <View className="flex-1 px-8">
          {/* Top small branding */}
          <View className="mt-6 flex-row items-center justify-between">
            <Text className="text-sm font-bold tracking-[6px] text-white/40">
              KIRITO LOGS
            </Text>

            <View className="border border-white/20 px-3 py-1">
              <Text className="text-[10px] font-bold tracking-[2px] text-white">
                v1.0
              </Text>
            </View>
          </View>

          {/* Main content */}
          <View className="flex-1 justify-center">
            {/* Icon block */}
            <View className="mb-10 h-28 w-28 items-center justify-center self-center border-4 border-white">
              <Ionicons name="library-outline" size={54} color="white" />
            </View>

            {/* Heading */}
            <Text className="text-center text-6xl font-black uppercase text-white">
              Kirito
            </Text>

            <Text className="text-center text-6xl font-black uppercase text-white/20">
              Logs
            </Text>

            {/* Divider */}
            <View className="my-8 h-[1px] bg-white/10" />

            {/* Description */}
            <Text className="px-4 text-center text-base leading-7 text-white/60">
              Technical articles, development notes, architecture insights, and
              engineering thoughts crafted with a minimal aesthetic.
            </Text>

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push('/blogs')}
              className="mt-14 flex-row items-center justify-center border-2 border-white bg-white py-5"
            >
              <Text className="mr-3 text-lg font-black uppercase tracking-[4px] text-black">
                Explore Blogs
              </Text>

              <Ionicons name="arrow-forward" size={20} color="black" />
            </TouchableOpacity>

            {/* Secondary button */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="mt-4 items-center border border-white/20 py-5"
            >
              <Text className="text-sm font-bold uppercase tracking-[4px] text-white">
                Latest Posts
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-xs uppercase tracking-[5px] text-white/30">
              Black • White • Minimal
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
