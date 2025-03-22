import React from "react";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-black">
      <Image
        source={require("~/assets/images/splash.gif")}
        className="w-full h-full object-cover"
      />
    </SafeAreaView>
  );
}

export default SplashScreen;
