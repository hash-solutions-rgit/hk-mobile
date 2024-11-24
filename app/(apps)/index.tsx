import { useState } from "react";
import { Button, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DeviceModal from "~mobile/components/DeviceConnectionModal";
import useBLE from "~mobile/hooks/useBLE";

function Home() {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
    checkBluetooth,
  } = useBLE();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      checkBluetooth();
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView className="bg-gray-50">
      <Button title="Scan for devices" onPress={scanForDevices} />
      {connectedDevice ? (
        <>
          <Text>Your Heart Rate Is:</Text>
          <Text>{heartRate} bpm</Text>
        </>
      ) : (
        <Text>Please Connect to a Heart Rate Monitor</Text>
      )}

      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
      >
        <Text>{connectedDevice ? "Disconnect" : "Connect"}</Text>
      </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
}

export default Home;
