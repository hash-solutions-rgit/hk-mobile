import { useEffect, useRef } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import bleManager, { Peripheral } from "react-native-ble-manager";

import * as ExpoDevice from "expo-device";

import BluetoothModule from "~/utils/bluetooth-module";
import { useBluetoothDeviceModuleStore } from "~/store";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  stopScanPeripherals(): Promise<void>;
  connectToDevice: (deviceId: Peripheral) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Peripheral | null;
  allDevices: Map<string, Peripheral>;
  checkBluetooth: () => void;
  renameDevice: (name: string) => void;
  isScanning: boolean;
}

function useBLE(): BluetoothLowEnergyApi {
  // hooks
  const {
    connectedDevice,
    allDevices,
    addDevice,
    setIsScanning,
    isScanning,
    setConnectedDevice,
    setAllDevices,
  } = useBluetoothDeviceModuleStore();
  const bluetoothModule = BluetoothModule.getInstance();

  const heartBeatTimer = useRef<NodeJS.Timeout | null>(null);

  const checkBluetooth = async () => {
    await bluetoothModule.checkBluetooth();
  };

  const sendHeartBeat = (deviceId: Peripheral["id"]) => {
    heartBeatTimer.current = setTimeout(() => {
      bleManager.writeWithoutResponse(
        deviceId,
        bluetoothModule.DEVICE_SERVICE_UUID,
        bluetoothModule.DEVICE_CHARACTERISTIC_UUID,
        bluetoothModule.hexToByteArray("e0aa55")
      );
    }, 5000);
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

  const isDuplicteDevice = (devices: Peripheral[], nextDevice: Peripheral) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = async () => {
    setIsScanning(true);
    console.log(
      bluetoothModule.DEVICE_SERVICE_UUID,
      "bluetoothModule.DEVICE_SERVICE_UUID"
    );
    await bleManager.scan([bluetoothModule.DEVICE_SERVICE_UUID], 0, false, {});
  };

  const stopScanPeripherals = async () => {
    await bleManager.stopScan();
    setAllDevices(new Map());
  };

  const connectToDevice = async (device: Peripheral) => {
    try {
      await bleManager.connect(device.id);
      await bleManager.retrieveServices(device.id, [
        bluetoothModule.DEVICE_SERVICE_UUID,
      ]);
      await bluetoothModule.verifyPassword(device.id);
    } catch (error) {
      console.error("Error while connecting", error);
    }
  };

  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      await bluetoothModule.startStopDevice(connectedDevice.id, false);
      bleManager.disconnect(connectedDevice.id);
    }
  };

  //   handlers
  const handleOnDiscoverPeripheral = (peripheral: Peripheral) => {
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
    } else {
      addDevice(peripheral);
    }
  };

  const handleOnConnectPeripheral = async (peripheral: {
    peripheral: string;
    status: number;
  }) => {
    const peripheralDevice = allDevices.get(peripheral.peripheral);
    if (peripheralDevice) {
      setConnectedDevice(peripheralDevice);
      await stopScanPeripherals();
      sendHeartBeat(peripheral.peripheral);
    }
  };

  const handleOnStopScan = () => {
    setIsScanning(false);
  };

  const handleOnDisconnectPeripheral = (peripheral: {
    peripheral: string;
    status: number;
  }) => {
    const peripheralDevice = allDevices.get(peripheral.peripheral);
    if (peripheralDevice) {
      setConnectedDevice(null);
      if (heartBeatTimer.current) clearTimeout(heartBeatTimer.current);
    }
  };

  const renameDevice = async (name: string) => {
    if (!connectedDevice) return;
    const hexString = stringToHex(name);
    const byteData = bluetoothModule.hexToByteArray("22" + hexString);
    await bleManager.write(
      connectedDevice.id,
      bluetoothModule.DEVICE_SERVICE_UUID,
      bluetoothModule.DEVICE_CHARACTERISTIC_UUID,
      byteData
    );
  };

  const stringToHex = (str: string): string => {
    let hexString = "";
    for (let i = 0; i < str.length; i++) {
      hexString += str.charCodeAt(i).toString(16); // Convert each character to its hex value
    }
    return hexString;
  };

  const handleAndroidPermissions = () => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then((result) => {
        if (result) {
          console.debug(
            "[handleAndroidPermissions] User accepts runtime permissions android 12+"
          );
        } else {
          console.error(
            "[handleAndroidPermissions] User refuses runtime permissions android 12+"
          );
        }
      });
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((checkResult) => {
        if (checkResult) {
          console.debug(
            "[handleAndroidPermissions] runtime permission Android <12 already OK"
          );
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((requestResult) => {
            if (requestResult) {
              console.debug(
                "[handleAndroidPermissions] User accepts runtime permission android <12"
              );
            } else {
              console.error(
                "[handleAndroidPermissions] User refuses runtime permission android <12"
              );
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    try {
      bleManager
        .start({ showAlert: false })
        .then(() => console.debug("BleManager started."))
        .catch((error: any) =>
          console.error("BeManager could not be started.", error)
        );
    } catch (error) {
      console.error("unexpected error starting BleManager.", error);
      return;
    }

    const listeners = [
      bleManager.onDiscoverPeripheral(handleOnDiscoverPeripheral),
      bleManager.onConnectPeripheral(handleOnConnectPeripheral),
      bleManager.onStopScan(handleOnStopScan),
      bleManager.onDisconnectPeripheral(handleOnDisconnectPeripheral),
    ];

    handleAndroidPermissions();

    return () => {
      console.debug("[app] main component unmounting. Removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

  return {
    scanForPeripherals,
    requestPermissions,
    connectToDevice,
    allDevices,
    connectedDevice,
    disconnectFromDevice,
    checkBluetooth,
    isScanning,
    stopScanPeripherals,
    renameDevice,
  };
}

export default useBLE;
