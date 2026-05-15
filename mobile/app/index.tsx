import { Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-10 h-24 w-24 items-center justify-center rounded-none border-4 border-white bg-white">
          <Ionicons name="book" size={48} color="black" />
        </View>

        <Text className="mb-4 text-center text-6xl font-black uppercase tracking-tighter text-white">
          Antigravity
        </Text>

        <Text className="mb-16 px-4 text-center text-lg font-medium leading-7 text-white/60">
          Premium insights for modern engineers.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/blogs')}
          className="w-full flex-row items-center justify-center rounded-none bg-white py-6"
        >
          <Text className="mr-2 text-xl font-black uppercase tracking-widest text-black">
            Read Blogs
          </Text>
          <Ionicons name="arrow-forward" size={24} color="black" />
        </TouchableOpacity>

        <View className="absolute bottom-12">
          <Text className="text-xs font-bold uppercase tracking-[4px] text-white/30">
            Black & White Edition
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
