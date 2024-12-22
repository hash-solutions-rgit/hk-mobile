import { LayoutChangeEvent, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./button";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // local state
  const [dimensions, setDimensions] = useState({
    height: 20,
    width: 100,
  });

  const buttonWidth = dimensions.width / state.routes.length;

  // hooks
  const tabPositionX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
    };
  });

  // handlers
  const handleLayoutChange = (event: LayoutChangeEvent) => {
    setDimensions({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
  };

  return (
    <View
      className="absolute bottom-8 flex-row justify-between items-center bg-white mx-20 py-4 rounded-full shadow-md border border-gray-200"
      onLayout={handleLayoutChange}
    >
      <Animated.View
        style={[
          {
            height: dimensions.height - 15,
            width: buttonWidth - 25,
          },
          animatedStyle,
        ]}
        className="absolute bg-black rounded-full mx-3"
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, {
            duration: 1500,
          });
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TabBarButton
            key={route.name}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            routeName={route.name}
            label={label as string}
          />
        );
      })}
    </View>
  );
}
