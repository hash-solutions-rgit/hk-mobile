import { Pressable } from "react-native";
import React, { useEffect } from "react";
import Render from "../render";
import { House } from "~/lib/icons/house";
import { ShoppingBag } from "~/lib/icons/shopping-bag";
import { Wind } from "~/lib/icons/wind";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { cn } from "~/lib/utils";

type Props = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  label: string;
};
type IconProps = {
  isFocused: boolean;
};

const icons = {
  index: ({ isFocused }: IconProps) => (
    <House className={cn("w-8 h-8", isFocused ? "text-white" : "text-black")} />
  ),
  device: ({ isFocused }: IconProps) => (
    <Wind className={cn("w-8 h-8", isFocused ? "text-white" : "text-black")} />
  ),
  shop: ({ isFocused }: IconProps) => (
    <ShoppingBag
      className={cn("w-8 h-8", isFocused ? "text-white" : "text-black")}
    />
  ),
};

const TabBarButton = ({
  isFocused,
  label,
  onLongPress,
  onPress,
  routeName,
}: Props) => {
  // hooks
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      duration: 350,
    });
  }, [scale, isFocused]);

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0]);

    return {
      opacity,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2]);

    const top = interpolate(scale.value, [0, 1], [0, 9]);

    return {
      transform: [
        {
          scale: scaleValue,
        },
      ],
      top,
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 justify-center items-center gap-1"
    >
      <Render renderIf={!!(routeName in icons)}>
        <Animated.View style={[animatedIconStyle]}>
          {icons[routeName as keyof typeof icons]({
            isFocused,
          })}
        </Animated.View>
      </Render>

      <Animated.Text style={[animatedTextStyle]} className="text-xs">
        {label}
      </Animated.Text>
    </Pressable>
  );
};

export default TabBarButton;
