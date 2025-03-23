import React from "react";
import Render from "~/components/common/render";
import { View } from "react-native";
import ScannedDevices from "./scanned-devices";
import ScanningDevices from "./scanning-devices";
import { useBluetoothDeviceModuleStore } from "~/store";

function ScanDevices() {
  // hooks
  const { allDevices } = useBluetoothDeviceModuleStore();

  return (
    <View className="flex gap-y-4 px-4 py-2 flex-col flex-1">
      <Render renderIf={!allDevices.size}>
        <ScanningDevices />
      </Render>

      <Render renderIf={!!allDevices.size}>
        <ScannedDevices />
      </Render>
    </View>
  );
}

export default ScanDevices;
