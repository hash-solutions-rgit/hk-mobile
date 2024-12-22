import { View } from "react-native";
import React from "react";
import { Text } from "../ui/text";

const WelcomeBanner = () => {
  return (
    <View className="flex flex-col gap-y-0.5">
      <Text className="text-5xl font-semibold">Welcome 👋</Text>
      <Text className="">Welcome to home</Text>
    </View>
  );
};

export default WelcomeBanner;
