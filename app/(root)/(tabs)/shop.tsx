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
      <WebView
        source={{ uri: "https://hauskorper.co.uk/" }}
        allowsInlineMediaPlayback
      />
    </SafeAreaView>
  );
};

export default ShopNow;
