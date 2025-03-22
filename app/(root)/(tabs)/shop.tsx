import { SafeAreaView } from "react-native";
import React from "react";
import ShopNowWebView from "~/components/common/shop-now-web-view";

const ShopNow = () => {
  return (
    <SafeAreaView className="flex-1">
      <ShopNowWebView />
    </SafeAreaView>
  );
};

export default ShopNow;
