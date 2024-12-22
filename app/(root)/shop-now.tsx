import { SafeAreaView, View } from "react-native";
import React from "react";
import { WebView } from "react-native-webview";
import { buttonVariants } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Link } from "expo-router";
import { cn } from "~/lib/utils";

const ShopNow = () => {
  return (
    <SafeAreaView className="flex-1">
      <WebView source={{ uri: "https://hauskorper.co.uk/" }} />

      <View className="p-4 bg-white">
        <Link
          href="/"
          className={cn(
            buttonVariants(),
            "flex flex-row items-center gap-2 justify-center"
          )}
        >
          <Text className="text-white text-center">Go Back to Home</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
};

export default ShopNow;
