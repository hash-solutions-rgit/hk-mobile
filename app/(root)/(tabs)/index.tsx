import { View, TouchableOpacity } from "react-native";
import { useTabsStore } from "~/store";
import WelcomeBanner from "~/components/home/welcome-banner";
import ShopNowBanner from "~/components/home/shop-now-banner";
import { Text } from "~/components/ui/text";
import { Sparkle } from "~/lib/icons/sparkles";
import { BluetoothSearching } from "~/lib/icons/bluetooth-searching";
import { type SharedValue, withSpring } from "react-native-reanimated";
import { useRouter } from "expo-router";

type Props = {
  tabPositionX: SharedValue<number>;
};

export default function Home({ tabPositionX }: Props) {
  const router = useRouter();

  const handleOnPress = () => {
    router.push("/(root)/(tabs)/device");
  };

  return (
    <View className="flex flex-grow flex-col gap-y-4 p-5">
      <WelcomeBanner />
      <ShopNowBanner />

      <View className="flex gap-4 border-2 border-gray-200 p-4 rounded-lg bg-gray-50 shadow">
        <View className="bg-primary rounded-full w-16 h-16 mx-auto flex items-center justify-center">
          <Sparkle className="text-white w-12 h-12" />
        </View>
        <Text className="text-2xl font-bold text-center">
          Elevate Your Spaces with Freshness Redefine
        </Text>

        <Text className="text-sm font-medium text-gray-600">
          Transform your home with our advanced fresheners, delivering lasting
          fragrance and effortless comfort for a touch of everyday luxury.
        </Text>

        <TouchableOpacity
          className="flex flex-row gap-x-2 justify-center !items-center !h-fit py-4 px-6 bg-primary rounded-lg"
          onPress={handleOnPress}
        >
          <BluetoothSearching className="w-5 h-5 text-white" />
          <Text className="text-white !text-2xl !font-semibold">
            Connect to Device
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
