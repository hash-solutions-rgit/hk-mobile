import { ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";
import DeviceController from "~/components/device/device-controller";

import {
  enableBluetooth,
  handleLocationPermission as handleLocationPermissionService,
  handleBluetoothPermission as handleBluetoothPermissionService,
} from "~/utils/permissions";
import useBLE from "~/hooks/useBLE";

const DevicesTab = () => {
  const [isBluetoothPermitted, setIsBluetoothPermitted] = useState(false);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);

  const { connectedDevice, scanForPeripherals } = useBLE();

  const handleBluetoothPermission = async () => {
    const result = await handleBluetoothPermissionService();
    if (result) {
      setIsBluetoothPermitted(result);
    }
  };

  const handleLocationPermission = async () => {
    const result = await handleLocationPermissionService();
    setIsLocationPermitted(result);
  };

  const handleEnableBluetooth = async () => {
    const result = await enableBluetooth();
    console.log("handleEnableBluetooth", result);
    if (result) {
      setIsBluetoothEnabled(result);
    }
  };

  useEffect(() => {
    if (isLocationPermitted) {
      void handleBluetoothPermission();
      return;
    }

    void handleLocationPermission();
  }, [isLocationPermitted]);

  useEffect(() => {
    if (isBluetoothPermitted) {
      void handleEnableBluetooth();
      return;
    }
    void handleBluetoothPermission();
  }, [isBluetoothPermitted]);

  useEffect(() => {
    console.log("isBluetoothEnabled", isBluetoothEnabled);
    console.log("isBluetoothPermitted", isBluetoothPermitted);
    if (!isBluetoothEnabled || !isBluetoothPermitted) {
      return;
    }
    void scanForPeripherals();
  }, [isBluetoothPermitted, isLocationPermitted, isBluetoothEnabled]);

  return (
    <ScrollView className="flex flex-col gap-y-4 p-5 flex-1 h-full">
      <Render renderIf={!!connectedDevice}>
        <DeviceController />
      </Render>
      <Render renderIf={!connectedDevice}>
        <ScanDevices />
      </Render>
    </ScrollView>
  );
};

export default DevicesTab;
