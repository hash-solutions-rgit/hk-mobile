/* eslint-disable no-bitwise */
import { useMemo, useState } from "react";
import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from "react-native-ble-plx";

import * as ExpoDevice from "expo-device";

import base64 from "react-native-base64";

import { atob } from "react-native-quick-base64";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  connectToDevice: (deviceId: Device) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Device | null;
  allDevices: Device[];
  heartRate: number;
  checkBluetooth: () => void;
  bleManager: BleManager;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [heartRate, setHeartRate] = useState<number>(0);

  const promptToEnableBluetooth = () => {
    Alert.alert(
      "Enable Bluetooth",
      "Bluetooth is required to connect to devices. Please turn it on.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              // Open iOS settings
              Linking.openURL("App-Prefs:Bluetooth");
            } else {
              // Open Android settings
              bleManager.enable(); // Tries to enable Bluetooth on Android
            }
          },
        },
      ]
    );
  };

  const checkBluetooth = async () => {
    // For iOS, request permissions explicitly
    if (Platform.OS === "ios") {
      await bleManager.enable();
    }

    // Listen for Bluetooth state changes
    const subscription = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        console.log("Bluetooth is enabled");
      } else {
        promptToEnableBluetooth();
      }
    }, true);

    // Cleanup the subscription on unmount
    return () => subscription.remove();
  };

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = () =>
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }

      if (!device) return;
      setAllDevices((prevState: Device[]) => {
        if (!isDuplicteDevice(prevState, device)) {
          return [...prevState, device];
        }
        return prevState;
      });
    });

  const discoverServicesAndCharacteristics = async (device: Device) => {
    try {
      const services = await device.services();
      for (const service of services) {
        console.log(`Service UUID: ${service.uuid}`);
        const characteristics = await service.characteristics();
        for (const characteristic of characteristics) {
          console.log(`Characteristic UUID: ${characteristic.uuid}`);
        }
      }
    } catch (error) {
      console.error("Discovery error:", error);
    }
  };

  const readCharacteristic = async (
    device: Device,
    serviceUUID: string,
    characteristicUUID: string
  ) => {
    try {
      const characteristic = await device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      console.log("Characteristic Value:", characteristic.value); // Decoded value (Base64 encoded)
      console.log(base64.decode(characteristic.value ?? ""));
    } catch (error) {
      console.error("Read Error:", error);
    }
  };

  // const interactWithCustomCharacteristic = async (device: Device) => {
  //   try {
  //     // Example: Reading characteristic
  //     const characteristic = await device.wri(
  //       "0000fff0-0000-1000-8000-00805f9b34fb",
  //       "0000fff6-0000-1000-8000-00805f9b34fb"
  //     );
  //     console.log("Custom Characteristic Value:", characteristic.value);
  //   } catch (error) {
  //     console.error("Error interacting with custom characteristic:", error);
  //   }
  // };

  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      bleManager.stopDeviceScan();
      await discoverServicesAndCharacteristics(device);
      // readCharacteristic(
      //   device,
      //   "00001800-0000-1000-8000-00805f9b34fb",
      //   "00002a00-0000-1000-8000-00805f9b34fb"
      // );
      // readCharacteristic(
      //   device,
      //   "00001800-0000-1000-8000-00805f9b34fb",
      //   "00002a01-0000-1000-8000-00805f9b34fb"
      // );
      // readCharacteristic(
      //   device,
      //   "00001800-0000-1000-8000-00805f9b34fb",
      //   "00002a02-0000-1000-8000-00805f9b34fb"
      // );  error

      // data
      // await interactWithCustomCharacteristic(device);
      // send data to this
      // readCharacteristic(
      //   device,
      //   "0000fff0-0000-1000-8000-00805f9b34fb",
      //   "0000fff0-0000-1000-8000-00805f9b34fb",
      // );

      const hexData = "8f383838384f4b3031";

      const parsseData = (hexData: string) => {
        const byteArray = hexData
          ?.match(/.{1,2}/g)
          ?.map((byte) => parseInt(byte, 16));

        // Convert byte array to Base64
        const base64Data = base64.encode(String.fromCharCode(...byteArray!));

        return base64Data;
      };

      const s = await device.writeCharacteristicWithResponseForService(
        "0000fff0-0000-1000-8000-00805f9b34fb",
        "0000fff6-0000-1000-8000-00805f9b34fb",
        parsseData(hexData)
      );

      console.log("Servive Password", JSON.stringify(s));

      const ss = await device.writeCharacteristicWithResponseForService(
        "0000fff0-0000-1000-8000-00805f9b34fb",
        "0000fff6-0000-1000-8000-00805f9b34fb",
        parsseData("2A0102010101030000173b3E0007000A0064")
      );
    } catch (e) {
      console.log("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setHeartRate(0);
    }
  };

  const onHeartRateUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      console.log(error);
      return -1;
    } else if (!characteristic?.value) {
      console.log("No Data was recieved");
      return -1;
    }

    const rawData = base64.decode(characteristic.value);
    let innerHeartRate: number = -1;

    const firstBitValue: number = Number(rawData) & 0x01;

    if (firstBitValue === 0) {
      innerHeartRate = rawData[1].charCodeAt(0);
    } else {
      innerHeartRate =
        Number(rawData[1].charCodeAt(0) << 8) +
        Number(rawData[2].charCodeAt(2));
    }

    setHeartRate(innerHeartRate);
  };

  const startStreamingData = async (device: Device) => {
    if (device) {
      device.monitorCharacteristicForService(
        HEART_RATE_UUID,
        HEART_RATE_CHARACTERISTIC,
        onHeartRateUpdate
      );
    } else {
      console.log("No Device Connected");
    }
  };

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    heartRate,
    checkBluetooth,
    bleManager,
  };
}

export default useBLE;
