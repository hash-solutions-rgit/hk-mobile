import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Peripheral } from "react-native-ble-manager";
import Render from "~/components/common/render";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import useBLE from "~/hooks/useBLE";

function ScannedDevices() {
  // hooks
  const { allDevices, scanForPeripherals, isScanning } = useBLE();

  return (
    <View className="gap-2 flex-col flex">
      <View className="flex-col gap-2 flex sticky top-0">
        <Text className="text-white text-center font-semibold text-lg border shadow px-4 py-2 rounded-xl bg-black">
          Scanned Devices
        </Text>
        <View className="flex-row flex items-center gap-2">
          <Text className="text-gray-500 font-medium text-base">
            Could not find your device?
          </Text>
          <Button
            className="shrink-0"
            size="sm"
            variant="link"
            onPress={scanForPeripherals}
          >
            <Render renderIf={!isScanning}>
              <Text>Scan Now</Text>
            </Render>
            <Render renderIf={isScanning}>
              <Text>Scanning...</Text>
            </Render>
          </Button>
          <Render renderIf={isScanning}>
            <ActivityIndicator className="w-4 h-4 text-gray-500" />
          </Render>
        </View>
      </View>
      {Array.from(allDevices.values()).map((device, index) => (
        <BluetoothScannedDeviceCard
          item={device}
          index={index}
          key={device.id}
        />
      ))}
    </View>
  );
}

type BluetoothScannedDeviceCardProps = {
  item: Peripheral;
  index: number;
};

function BluetoothScannedDeviceCard({ item }: BluetoothScannedDeviceCardProps) {
  // hooks
  const { connectToDevice } = useBLE();

  // handlers
  const handleConnectToDevice = async () => {
    await connectToDevice(item);
  };

  return (
    <Button onPress={handleConnectToDevice} variant={"outline"}>
      <Text className="text-black">{item.name}</Text>
    </Button>
  );
}

export default ScannedDevices;
