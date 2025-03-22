import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
} from "react-native-reanimated";

type Props = {
  children: ReactNode;
};

const CircleAnimation = ({ children }: Props) => {
  return (
    <View className="flex-1 justify-center items-center relative">
      {children}
    </View>
  );
};

export default CircleAnimation;
