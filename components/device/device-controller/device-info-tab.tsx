import React, { useState, useCallback } from "react";
import { TabsContent } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import useBLE from "~/hooks/useBLE";
import { useDeviceStore } from "~/store";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import Pencil from "~/lib/icons/pencil";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { View } from "react-native";
import { Input } from "~/components/ui/input";

const DeviceInfoTab = () => {
  const { connectedDevice, disconnectFromDevice, renameDevice } = useBLE();

  // local state
  const [deviceName, setDeviceName] = useState("");
  const [open, setOpen] = useState(false);

  const { isDeviceOn } = useDeviceStore();

  const handleDeviceNameChange = (text: string) => {
    setDeviceName(text);
  };

  const handleDeviceNameApi = useCallback(async () => {
    await renameDevice(deviceName);
    setDeviceName("");
    setOpen(false);
  }, [deviceName]);

  return (
    <TabsContent value="info" className="py-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-x-2">
            <Text className="text-black">{connectedDevice?.name}</Text>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96">
                <DialogHeader>
                  <DialogTitle>Rename Device</DialogTitle>
                </DialogHeader>
                <View>
                  <Input
                    placeholder="Device Name"
                    value={deviceName}
                    onChangeText={handleDeviceNameChange}
                  />
                  <Button
                    className="mt-4"
                    disabled={!deviceName || deviceName.length < 3}
                    onPress={handleDeviceNameApi}
                  >
                    <Text>Rename</Text>
                  </Button>
                </View>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text>
            Device Status :{" "}
            {isDeviceOn ? (
              <Text className="font-bold text-green-500">ON</Text>
            ) : (
              <Text className="font-bold text-red-500">OFF</Text>
            )}
          </Text>
        </CardContent>
        <CardFooter>
          <Button size="sm" onPress={disconnectFromDevice}>
            <Text className="text-white">Disconnect</Text>
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default DeviceInfoTab;
