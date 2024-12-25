import { View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import useBLE from "~/hooks/useBLE";
import BluetoothModule from "~/utils/bluetooth-module";
import { router } from "expo-router";
import ScannedDevices from "../scan-devices/scanned-devices";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import * as Haptics from "expo-haptics";
import { Power } from "~/lib/icons/power";
import { cn } from "~/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import ControllerTab from "./controller-tab";
import { useDeviceStore } from "~/store";
import DeviceInfoTab from "./device-info-tab";

type TabsValue = "controller" | "info";

const DeviceController = () => {
  const { connectedDevice } = useBLE();

  const bluetoothModule = BluetoothModule.getInstance();

  const { isDeviceOn } = useDeviceStore();
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
