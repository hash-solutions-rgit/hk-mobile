import { ScrollView } from "react-native";
import React from "react";
import Render from "~/components/common/render";
import ScanDevices from "~/components/device/scan-devices";
import DeviceController from "~/components/device/device-controller";
import BluetoothLayout, { useBluetooth } from "~/layouts/bluetooth-layout";

const DevicesTab = () => {
  return (
    <ScrollView className="flex flex-col gap-y-4 p-5 flex-1 h-full">
      <BluetoothLayout>
        <DevicesTabs />
      </BluetoothLayout>
    </ScrollView>
  );
};

const DevicesTabs = () => {
  const { connectedDevice } = useBluetooth();
  return (
    <>
      <Render renderIf={!!connectedDevice}>
        <DeviceController />
      </Render>
      <Render renderIf={!connectedDevice}>
        <ScanDevices />
      </Render>
    </>
  );
};

export default DevicesTab;
