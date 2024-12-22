import { View, Text, ScrollView } from "react-native";
import React, { useEffect } from "react";
import useBLE from "~/hooks/useBLE";
import { Button } from "~/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";

const DevicesTab = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    checkBluetooth,
  } = useBLE();

  const checkBluetoothPermissions = async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.debug("isPermissionsEnabled", isPermissionsEnabled);
    if (isPermissionsEnabled) {
      checkBluetooth();
    }
  };

  useEffect(() => {
    checkBluetoothPermissions();
  }, []);

  return (
    <ScrollView className="flex flex-col gap-y-4 p-5 flex-1">
      <Render renderIf={!!connectedDevice}>
        <Text className="text-white">Connected to {connectedDevice?.name}</Text>
      </Render>
      <Render renderIf={!connectedDevice}>
        <ScanDevices />
      </Render>
    </ScrollView>
  );
};

export default DevicesTab;
