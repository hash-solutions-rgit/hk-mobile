import { View, Text } from "react-native";
import React, { useState } from "react";
import useBLE from "~/hooks/useBLE";
import ScannedDevices from "../scan-devices/scanned-devices";
import { cn } from "~/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ControllerTab from "./controller-tab";
import DeviceInfoTab from "./device-info-tab";
import { useBluetoothDeviceModuleStore } from "~/store";

type TabsValue = "controller" | "info";

const DeviceController = () => {
  const { connectedDevice } = useBluetoothDeviceModuleStore();

  const [value, setValue] = useState<TabsValue>("controller");

  if (!connectedDevice) {
    return <ScannedDevices />;
  }

  return (
    <View className="flex flex-col gap-y-4 p-5 flex-1 h-full">
      <Tabs
        value={value}
        onValueChange={(value) => setValue(value as TabsValue)}
        className="w-full mx-auto flex-col gap-1.5"
      >
        <TabsList className="flex-row w-full border border-gray-200 bg-white">
          <TabsTrigger value="controller" className="flex-1">
            <Text className={cn(value === "controller" && "text-white")}>
              Controller
            </Text>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex-1">
            <Text className={cn(value === "info" && "text-white")}>
              Device Info
            </Text>
          </TabsTrigger>
        </TabsList>
        <DeviceInfoTab />
        <ControllerTab />
      </Tabs>
    </View>
  );
};

export default DeviceController;
