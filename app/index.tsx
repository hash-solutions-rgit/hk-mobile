import { Button, SafeAreaView, Text } from "react-native";
import { BleManager } from "react-native-ble-plx";

const bleManager = new BleManager();
function Home() {
  const scanForDevices = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log("Device found:", device?.name, device?.id);
      // Optionally, stop scanning if you find your target device
      if (device?.name === "MyDevice") {
        bleManager.stopDeviceScan();
        connectToDevice(device.id);
      }
    });
  };

  const connectToDevice = async (deviceId: string) => {
    try {
      const device = await bleManager.connectToDevice(deviceId);
      console.log("Connected to device:", device.name);
      await device.discoverAllServicesAndCharacteristics();
      // Save device for future interactions
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <SafeAreaView className="bg-gray-50">
      <Text>Hello world</Text>

      <Button title="Scan for devices" onPress={scanForDevices} />
    </SafeAreaView>
  );
}

export default Home;
