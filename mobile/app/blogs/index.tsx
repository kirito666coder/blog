import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { dummyBlogs } from '../../data/blogs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BlogsList() {
  const router = useRouter();

  const renderBlogItem = ({ item }: { item: (typeof dummyBlogs)[0] }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/blogs/${item.slug}`)}
      className="mb-6 border-b border-white/10 bg-black p-6"
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-black uppercase tracking-[2px] text-white/40">
          {item.category}
        </Text>
        <Ionicons name="arrow-forward" size={16} color="white" />
      </View>

      <Text className="mb-3 text-2xl font-black uppercase leading-8 tracking-tight text-white">
        {item.title}
      </Text>

      <Text
        className="mb-6 text-sm font-medium leading-6 text-white/60"
        numberOfLines={3}
      >
        {item.excerpt}
      </Text>

      <View className="flex-row items-center">
        {item.tags.slice(0, 3).map((tag, index) => (
          <Text
            key={index}
            className="mr-4 text-[10px] font-bold uppercase tracking-widest text-white/20"
          >
            #{tag}
          </Text>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="flex-1">
        <View className="flex-row items-center justify-between border-b border-white/10 px-6 py-8">
          <View>
            <Text className="mb-2 text-[10px] font-black uppercase tracking-[4px] text-white/30">
              The Collection
            </Text>
            <Text className="text-5xl font-black uppercase tracking-tighter text-white">
              Archive
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-none bg-white"
          >
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dummyBlogs}
          renderItem={renderBlogItem}
          keyExtractor={(item) => item.slug}
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Text className="text-lg font-bold uppercase tracking-widest text-white/40">
                No Content
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}
