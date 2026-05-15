import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import Markdown from 'react-native-markdown-display';
import CodeBlock from '../../components/CodeBlock';
import { dummyBlogs } from '../../data/blogs';

export default function BlogDetail() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const blog = dummyBlogs.find((b) => b.slug === slug);

  if (!blog) {
    return (
      <View className="flex-1 items-center justify-center bg-black p-6">
        <Text className="mb-4 text-xl font-black uppercase text-white">
          Post not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white px-8 py-4"
        >
          <Text className="font-black uppercase text-black">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Markdown customization
  const rules = {
    fence: (node: any) => {
      const code = node.content;
      const lang = node.info || 'javascript';

      return <CodeBlock code={code} language={lang} />;
    },

    code_inline: (node: any) => (
      <Text className="rounded bg-white/10 px-1 py-0.5 font-mono text-white">
        {node.content}
      </Text>
    ),
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="flex-row items-center justify-between border-b border-white/10 px-6 py-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row gap-4">
          <Ionicons name="share-outline" size={24} color="white" />
          <Ionicons name="bookmark-outline" size={24} color="white" />
        </View>
      </View>

      <ScrollView className="flex-1 px-6">
        {/* CATEGORY */}
        <Text className="mt-8 text-xs font-bold uppercase text-white/40">
          {blog.category}
        </Text>

        {/* TITLE */}
        <Text className="mt-4 text-3xl font-black uppercase text-white">
          {blog.title}
        </Text>

        {/* MARKDOWN CONTENT */}
        <View className="mt-10">
          <Markdown
            rules={rules}
            style={{
              body: {
                color: 'rgba(255,255,255,0.85)',
                fontSize: 16,
                lineHeight: 26,
              },

              paragraph: {
                marginBottom: 14,
              },

              heading1: {
                color: 'white',
                fontSize: 30,
                fontWeight: '900',
                marginVertical: 10,
              },

              heading2: {
                color: 'white',
                fontSize: 24,
                fontWeight: '800',
                marginVertical: 8,
              },

              heading3: {
                color: 'white',
                fontSize: 20,
                fontWeight: '700',
              },

              list_item: {
                color: 'rgba(255,255,255,0.75)',
                marginBottom: 6,
              },

              strong: {
                color: 'white',
                fontWeight: '900',
              },

              em: {
                color: 'rgba(255,255,255,0.8)',
                fontStyle: 'italic',
              },

              code_inline: {
                backgroundColor: '#222',
              },
            }}
          >
            {blog.content}
          </Markdown>
        </View>

        {/* TAGS */}
        <View className="mt-10 flex-row flex-wrap">
          {blog.tags.map((tag, i) => (
            <View
              key={i}
              className="mb-2 mr-2 border border-white/10 bg-white/5 px-3 py-1"
            >
              <Text className="text-[10px] font-bold text-white/50">
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
