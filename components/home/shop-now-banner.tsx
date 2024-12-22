import { Link } from "expo-router";
import React from "react";
import { Image, View } from "react-native";

const ShopNowBanner = () => {
  return (
    <View className="bg-black rounded-lg border border-gray-200 h-52 w-full overflow-hidden">
      <Link href="/(root)/shop-now">
        <Image
          source={require("~/assets/images/shop-now.webp")}
          style={{ resizeMode: "contain", height: "100%", aspectRatio: 1 }}
        />
      </Link>
    </View>
  );
};

export default ShopNowBanner;
