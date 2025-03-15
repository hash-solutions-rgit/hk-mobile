import React, { useEffect } from "react";
import { TabsContent } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { Power } from "~/lib/icons/power";
import { useBluetoothDeviceModuleStore, useDeviceStore } from "~/store";
import * as Haptics from "expo-haptics";
import { Switch } from "~/components/ui/switch";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import BluetoothModule from "~/utils/bluetooth-module";
import IntensityController from "./intensity-controller";

const ControllerTab = () => {
  // hooks
  const { connectedDevice } = useBluetoothDeviceModuleStore();
  const { toggleIsDeviceOn, isDeviceOn } = useDeviceStore();

  const bluetoothModule = BluetoothModule.getInstance();
  // handlers
  const handleStartStopDevice = async () => {
    if (!connectedDevice) return;
    toggleIsDeviceOn();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  };

  useEffect(() => {
    if (!connectedDevice) return;
    bluetoothModule.startStopDevice(connectedDevice?.id, isDeviceOn);
  }, [bluetoothModule, connectedDevice, isDeviceOn]);

  return (
    <TabsContent value="controller" className="py-4 flex flex-col gap-y-4">
      <Button
        onPress={handleStartStopDevice}
        className={cn("w-36 h-36 rounded-full aspect-square mx-auto")}
        size="icon"
      >
        <Power className="text-white" size={100} />
      </Button>
      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-black">OFF</Text>
        <Switch checked={isDeviceOn} onCheckedChange={handleStartStopDevice} />
        <Text className="text-black">ON</Text>
      </View>

      <IntensityController />
    </TabsContent>
  );
};

export default ControllerTab;
