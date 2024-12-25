import { View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDeviceStore } from "~/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Minus } from "~/lib/icons/minus";
import { Plus } from "~/lib/icons/plus";
import { Gauge } from "~/lib/icons/gauge";
import useDebounce from "~/hooks/useDebounce";
import BluetoothModule from "~/utils/bluetooth-module";
import useBLE from "~/hooks/useBLE";

const IntensityController = () => {
  const { isDeviceOn } = useDeviceStore();
  const { connectedDevice } = useBLE();

  const bluetoothModule = BluetoothModule.getInstance();

  const [currentValue, setCurrentValue] = useState(1); // Value based on interaction

  const debouncedValue = useDebounce(currentValue, 500); // Debounce the value to prevent rapid updates

  const totalDashes = 20; // Number of dashes in the circle

  const incrementValue = () => {
    setCurrentValue((prev) => (prev < totalDashes ? prev + 1 : totalDashes));
  };

  const decrementValue = () => {
    setCurrentValue((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdjustIntensity = useCallback(() => {
    if (!connectedDevice) return;
    bluetoothModule.adjustIntensity(connectedDevice?.id, currentValue);
  }, [bluetoothModule, connectedDevice, currentValue]);

  // Use effect to trigger the start function when debounced value changes
  useEffect(() => {
    if (debouncedValue === currentValue) {
      handleAdjustIntensity();
    }
  }, [currentValue, debouncedValue, handleAdjustIntensity]);

  return (
    <Card className={cn(!isDeviceOn && "bg-card-foreground/10")}>
      <CardHeader className="">
        <CardTitle className="text-black flex items-center gap-x-2 flex-row">
          <Gauge className="text-black" size={20} />
          <Text className="text-black">Intensity</Text>
        </CardTitle>
        <CardDescription className="text-gray-600">
          Adjust the intensity of the device
        </CardDescription>
      </CardHeader>
      <CardContent className="py-1 px-2 flex flex-row items-center gap-x-2 justify-center">
        <View className="flex-row items-center justify-center gap-x-2">
          <Button onPress={decrementValue} disabled={!isDeviceOn} size="icon">
            <Minus className="text-white" />
          </Button>
          <View className="relative justify-center items-center w-48 h-48">
            {/* Circular Dashes */}
            {Array.from({ length: totalDashes }).map((_, index) => (
              <View
                key={index}
                className="absolute w-2 h-6"
                style={{
                  backgroundColor: index < currentValue ? "#4CAF50" : "#D3D3D3", // Active dashes are highlighted
                  transform: [
                    { rotate: `${index * (360 / totalDashes)}deg` },
                    { translateY: -60 }, // Adjust for smaller radius
                  ],
                  borderRadius: 2,
                }}
              />
            ))}

            {/* Center Value */}
            <Text className="absolute text-xl font-bold">{currentValue}</Text>
          </View>
          <Button onPress={incrementValue} disabled={!isDeviceOn} size="icon">
            <Plus className="text-white" />
          </Button>
        </View>
      </CardContent>
    </Card>
  );
};

export default IntensityController;
