import { ScrollView, Text } from "react-native";
import React, { useEffect, useState } from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";
import DeviceController from "~/components/device/device-controller";
import { Loader } from "lucide-react-native";

const DevicesTab = () => {
  const { requestPermissions, connectedDevice, checkBluetooth } = useBLE();

  const [loading, setLoading] = useState(false);

  const [isPermissionsChecked, setIsPermissionsChecked] = useState(false);

  useEffect(() => {
    const checkBluetoothPermissions = async () => {
      setLoading(true);
      const isPermissionsEnabled = await requestPermissions();
      console.debug("isPermissionsEnabled", isPermissionsEnabled);
      if (isPermissionsEnabled) {
        await checkBluetooth();
        setLoading(false);
        setIsPermissionsChecked(true);
      }
    };

    if (isPermissionsChecked) return;

    checkBluetoothPermissions();
  }, [isPermissionsChecked]);

  if (loading) return <Text>Loading</Text>;

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
