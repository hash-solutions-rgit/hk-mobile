import { ActivityIndicator, ScrollView } from "react-native";
import React from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import LottieView from "lottie-react-native";
import * as animation from "~/assets/lottie/bluetooth-animation.json";
import { View } from "react-native";

const ScanDevices = () => {
  // hooks
  const { allDevices, isScanning, connectedDevice, scanForPeripherals } =
    useBLE();

  // handlers
  const handleScanForPeripherals = () => {
    scanForPeripherals();
  };

  return (
    <View className="flex gap-y-4 p-5 flex-col flex-1">
      {/* <Render renderIf={!isScanning}> */}
      <Button
        className="flex-row justify-center items-center text-center gap-2 w-full flex flex-1"
        onPress={handleScanForPeripherals}
      >
        <Text className="text-white">Scan for devices</Text>
      </Button>
      {/* </Render> */}

      {/* <Render renderIf={isScanning}> */}
      <View className="flex-row justify-center items-center flex w-full h-56">
        <LottieView
          autoPlay
          loop
          style={{
            width: 200,
            height: 200,
          }}
          // Find more Lottie files at https://lottiefiles.com/featured
          source={animation}
        />
      </View>
      {/* </Render> */}

      <Render renderIf={!!allDevices.size}>
        <View className="gap-2 flex-col flex">
          <Text className="text-white">Devices</Text>
          {Array.from(allDevices.values()).map((device) => (
            <Button key={device.id}>
              <Text className="text-white">{device.name}</Text>
            </Button>
          ))}
        </View>
      </Render>
      {/* 
      <View className="flex-row justify-center items-center gap-2 h-full">
        <Render renderIf={!!connectedDevice}>
          <Text className="text-white">
            Connected to {connectedDevice?.name}
          </Text>
        </Render>
        <Render renderIf={!connectedDevice}>
          <Text className="">No device connected</Text>
        </Render>
      </View> */}
    </View>
  );
};

export default ScanDevices;
