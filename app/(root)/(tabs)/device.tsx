import { ScrollView } from "react-native";
import React from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";
import DeviceController from "~/components/device/device-controller";

const DevicesTab = () => {
  const { connectedDevice } = useBLE();

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
