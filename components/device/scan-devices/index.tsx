import { ActivityIndicator, ScrollView } from "react-native";
import React, { useEffect } from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { LoaderCircle } from "~/lib/icons/loader-circle";
import { View } from "lucide-react-native";

const ScanDevices = () => {
  // hooks
  const { allDevices, isScanning, connectedDevice } = useBLE();

  return (
    <ScrollView className="flex flex-col gap-y-4 p-5 flex-1">
      <Button className="flex-row justify-center items-center text-center gap-2">
        <Render renderIf={isScanning}>
          <>
            <ActivityIndicator className="w-10 h-10 text-white" />
            <Text>Scanning for devices...</Text>
          </>
        </Render>

        <Render renderIf={!isScanning}>
          <Text className="text-white">Scan for devices</Text>
        </Render>
      </Button>

      <Render renderIf={!!allDevices.size}>
        <View className="gap-2 flex-col">
          <Text className="text-white">Devices</Text>
          {Array.from(allDevices.values()).map((device) => (
            <Button>
              <Text className="text-white">{device.name}</Text>
            </Button>
          ))}
        </View>
      </Render>

      <View className="flex-row justify-center items-center gap-2">
        <Render renderIf={!!connectedDevice}>
          <Text className="text-white">
            Connected to {connectedDevice?.name}
          </Text>
        </Render>
        <Render renderIf={!connectedDevice}>
          <Text className="text-white">No device connected</Text>
        </Render>
      </View>
    </ScrollView>
  );
};

export default ScanDevices;
