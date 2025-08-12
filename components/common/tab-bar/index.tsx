import { LayoutChangeEvent, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "./button";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({
    height: 20,
    width: 100,
  });
  const tabPositionX = useSharedValue(0);

  const buttonWidth = dimensions.width / state.routes.length;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: tabPositionX.value,
        },
      ],
    };
  });

  const handleLayoutChange = (event: LayoutChangeEvent) => {
    setDimensions({
      height: event.nativeEvent.layout.height,
      width: event.nativeEvent.layout.width,
    });
  };

  useEffect(() => {
    tabPositionX.value = withSpring(buttonWidth * state.index, {
      damping: 15,
      stiffness: 120,
    });
  }, [state.index, buttonWidth]);

  return (
    <View
      className="absolute bottom-8 flex-row justify-between items-center bg-white mx-20 py-4 rounded-full shadow-md border border-gray-200"
      onLayout={handleLayoutChange}
    >
      <Animated.View
        style={[
          {
            height: dimensions.height - 15,
            width: buttonWidth,
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
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
          />
        );
      })}
    </View>
  );
}