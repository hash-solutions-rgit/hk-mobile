import { View, Text } from "react-native";
import React, { useEffect } from "react";
import useBLE from "~/hooks/useBLE";

const ScanDevices = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    checkBluetooth,
  } = useBLE();

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      checkBluetooth();
      scanForPeripherals();
    }
  };

  useEffect(() => {
    scanForDevices();
  }, []);

  return (
    <View>
      <Text>ScanDevices</Text>
    </View>
  );
};

export default ScanDevices;
