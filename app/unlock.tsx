import { ScrollView, View } from "react-native";
import React, { useState } from "react";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const Unlock = () => {
  const [pin, setPin] = useState("");

  //   handlers
  const handlePinChange = (text: string) => {
    setPin(text);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-5">
      <View className="flex flex-col gap-y-4">
        <Text>Unlock the App to continue</Text>
        <Input
          placeholder="Enter your pin"
          onChangeText={handlePinChange}
          keyboardType="numeric"
          value={pin}
        />
        <Button>
          <Text>Unlock</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default Unlock;
