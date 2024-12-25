import { ScrollView } from "react-native";
import React, { useEffect } from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";
import DeviceController from "~/components/device/device-controller";

const DevicesTab = () => {
  const { requestPermissions, connectedDevice, checkBluetooth } = useBLE();

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
    <ScrollView className="flex flex-col gap-y-4 p-5 flex-1 h-full">
      {/* <Render renderIf={!!connectedDevice}> */}
      <DeviceController />
      {/* </Render> */}
      {/* <Render renderIf={!connectedDevice}>
        <ScanDevices />
      </Render> */}
    </ScrollView>
  );
};

export default DevicesTab;
