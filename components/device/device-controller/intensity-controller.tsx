import { View, Text, Animated, PanResponder } from "react-native";
import React, { useState } from "react";
import { Power } from "~/lib/icons/power";
import { useDeviceStore } from "~/store";

const IntensityController = () => {
  const { isDeviceOn } = useDeviceStore();

  const [angle] = useState(new Animated.Value(0));
  const [currentValue, setCurrentValue] = useState(0); // Value based on rotation

  const centerX = 200; // Adjust these values to the center of your container
  const centerY = 400; // Adjust these values to the center of your container

  const totalDashes = 30; // Number of dashes in the circle

  const calculateAngle = (x: number, y: number) => {
    const dx = x - centerX;
    const dy = y - centerY;
    const angleRad = Math.atan2(dy, dx);
    const newAngle = (angleRad * 180) / Math.PI + 90; // Convert to degrees
    return newAngle >= 0 ? newAngle : newAngle + 360;
  };

  const handleTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const newAngle = calculateAngle(locationX, locationY);

    // Map the angle to a percentage (0-100)
    const mappedValue = Math.round((newAngle / 360) * 100);
    setCurrentValue(mappedValue);

    // Animate rotation
    Animated.spring(angle, {
      toValue: newAngle,
      useNativeDriver: true,
    }).start();
  };

  // Calculate the number of active dashes based on the currentValue
  const activeDashes = Math.round((currentValue / 100) * totalDashes);

  return (
    <View
      className="relative justify-center items-center w-64 h-64"
      onStartShouldSetResponder={() => true} // Allow touch gestures
      onResponderRelease={handleTouch} // Handle touch gestures
    >
      {/* Circular Dashes */}
      {Array.from({ length: totalDashes }).map((_, index) => (
        <View
          key={index}
          className="absolute w-2 h-6"
          style={{
            backgroundColor: index < activeDashes ? "#4CAF50" : "#D3D3D3", // Active dashes are highlighted
            transform: [
              { rotate: `${index * (360 / totalDashes)}deg` },
              { translateY: -80 },
            ],
            borderRadius: 2,
          }}
        />
      ))}

      {/* Rotating Knob */}
      <Animated.View
        style={{
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f3f3f3",
          transform: [
            {
              rotate: angle.interpolate({
                inputRange: [0, 360],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        }}
      >
        <Power size={28} className="text-white" />
      </Animated.View>
    </View>
  );
};

export default IntensityController;
