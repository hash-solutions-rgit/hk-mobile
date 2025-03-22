import React from "react";
import { View } from "react-native";
import { buttonVariants } from "../ui/button";
import { Text } from "../ui/text";
import { CirclePlus } from "~/lib/icons/circle-plus";
import { Link } from "expo-router";
import { cn } from "~/lib/utils";

const AddDevice = () => {
  return (
    <View className="p-2">
      <Link
        className={cn(
          buttonVariants(),
          "bg-primary text-white rounded-full p-2 text-center"
        )}
        href="/(root)/(app)/scan-device"
      >
        <View className="flex-1 flex items-center justify-center flex-row gap-2">
          <CirclePlus className="w-6 h-6 text-white" />
          <Text className="text-white">Add Device</Text>
        </View>
      </Link>
    </View>
  );
};

export default AddDevice;
