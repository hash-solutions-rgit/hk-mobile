import React from "react";
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

const DeviceInfoTab = () => {
  const { connectedDevice, disconnectFromDevice } = useBLE();

  const { isDeviceOn } = useDeviceStore();
  return (
    <TabsContent value="info" className="py-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{connectedDevice?.name}</CardTitle>
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
