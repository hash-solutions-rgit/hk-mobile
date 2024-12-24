import { ActivityIndicator, ScrollView } from "react-native";
import React, { useEffect } from "react";
import useBLE from "~/hooks/useBLE";
import Render from "~/components/common/render";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { View } from "react-native";
import { BluetoothSearching } from "~/lib/icons/bluetooth-searching";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const ScanDevices = () => {
  // hooks
  const { allDevices, scanForPeripherals, connectToDevice, connectedDevice } =
    useBLE();

  const scale = useSharedValue(0);

  const rangeScale = useSharedValue(1);

  const showAnimation = useSharedValue(0);

  // handlers
  const handleScanForPeripherals = () => {
    scanForPeripherals();
  };

  showAnimation.value = withRepeat(
    withTiming(0, {
      duration: 10000,
      easing: Easing.inOut(Easing.ease),
    })
  );

  scale.value = withSequence(
    withTiming(1, {
      duration: 800,
      easing: Easing.inOut(Easing.ease),
    }),
    withDelay(
      400,
      withTiming(2, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      })
    )
  );

  rangeScale.value = withDelay(
    2000,
    withRepeat(
      withTiming(2, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false
    )
  );

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1, 2], [0, 1.4, 1]);

    return { transform: [{ scale: scaleValue }] };
  });

  const animatedRangeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rangeScale.value }],
      opacity: rangeScale.value <= 1 ? 0 : 2 - rangeScale.value, // Fade out effect
    };
  });

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      opacity: showAnimation.value > 0 ? 1 : 0,
    };
  });

  useEffect(() => {
    handleScanForPeripherals();
  }, []);

  return (
    <View className="flex gap-y-4 p-5 flex-col flex-1">
      <View className="flex-row justify-center items-center flex w-full h-60 relative">
        <Animated.View
          className="flex-1 justify-center items-center relative"
          // style={[animatedCircleStyle]}
        >
          <Animated.View
            style={[animatedRangeStyle]}
            className="w-32 h-32 bg-transparent rounded-full border-2 border-gray-900 absolute top-0 left-auto right-auto bottom-0"
          />
          <Animated.View
            className="flex items-center justify-center border-2 border-gray-900 rounded-full w-32 h-32"
            style={[animatedStyle]}
          >
            <BluetoothSearching
              className="text-gray-900 w-16 h-16"
              width={64}
              height={64}
            />
          </Animated.View>
        </Animated.View>
      </View>

      <View>
        <Text className="text-center text-sm text-gray-400">
          Please wait while we search for your device.
        </Text>
      </View>

      <View>
        <Text className="text-medium text-center">Cant find your device?</Text>
        <Text className="text-sm text-gray-400">
          Please make sure your device is powered on and please be within the
          vicinity of your Diffuser.
        </Text>
      </View>
      {/* </Render> */}

      <Render renderIf={!!allDevices.size}>
        <View className="gap-2 flex-col flex">
          <Text className="text-white">Devices</Text>
          {Array.from(allDevices.values()).map((device) => (
            <Button
              key={device.id}
              onPress={async () => {
                await connectToDevice(device);
              }}
            >
              <Text className="text-white">{device.name}</Text>
            </Button>
          ))}
        </View>
      </Render>

      <View className="flex-row justify-center items-center gap-2 h-full">
        <Render renderIf={!!connectedDevice}>
          <Text className="text-black">
            Connected to {connectedDevice?.name}
          </Text>
        </Render>
        <Render renderIf={!connectedDevice}>
          <Text className="text-black">No device connected</Text>
        </Render>
      </View>
    </View>
  );
};

export default ScanDevices;
