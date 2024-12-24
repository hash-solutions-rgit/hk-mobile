import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import useBLE from "~/hooks/useBLE";
import BluetoothModule from "~/utils/bluetooth-module";

const DeviceController = () => {
  const { connectedDevice } = useBLE();

  const bluetoothModule = BluetoothModule.getInstance();

  const [isDevice, setIsDevice] = useState(false);

  if (!connectedDevice) {
    return <Text className="text-black">No device connected</Text>;
  }

  useEffect(() => {
    bluetoothModule.startStopDevice(connectedDevice?.id, isDevice);
  });

  return (
    <View>
      <Text className="text-black">Connected to {connectedDevice?.name}</Text>
      <Button
        onPress={() => {
          setIsDevice((prev) => !prev);
        }}
      >
        <Text className="text-white">{isDevice ? "ON" : "OFF"}</Text>
      </Button>
    </View>
  );
};

export default DeviceController;
