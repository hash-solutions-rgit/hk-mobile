import { useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import bleManager, { Peripheral } from "react-native-ble-manager";

import * as ExpoDevice from "expo-device";

import BluetoothModule from "~/utils/bluetooth-module";
import { useBluetoothDeviceModuleStore } from "~/store";

const DEVICE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const DEVICE_CHARACTERISTIC_UUID = "0000fff6-0000-1000-8000-00805f9b34fb";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): void;
  stopScanPeripherals(): Promise<void>;
  connectToDevice: (deviceId: Peripheral) => Promise<void>;
  disconnectFromDevice: () => void;
  connectedDevice: Peripheral | null;
  allDevices: Map<string, Peripheral>;
  checkBluetooth: () => void;
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

  const checkBluetooth = async () => {
    await bluetoothModule.checkBluetooth();
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
    await bleManager.scan([DEVICE_SERVICE_UUID], 0, false, {});
  };

  const stopScanPeripherals = async () => {
    await bleManager.stopScan();
    setAllDevices(new Map());
  };

  const discoverServicesAndCharacteristics = async (device: Peripheral) => {
    // try {
    //   const services = await device.services();
    //   for (const service of services) {
    //     console.log(`Service UUID: ${service.uuid}`);
    //     const characteristics = await service.characteristics();
    //     for (const characteristic of characteristics) {
    //       console.log(`Characteristic UUID: ${characteristic.uuid}`);
    //     }
    //   }
    // } catch (error) {
    //   console.error("Discovery error:", error);
    // }
  };

  const connectToDevice = async (device: Peripheral) => {
    try {
      await bleManager.connect(device.id);
    } catch (error) {
      console.error("Error while connecting", error);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      bleManager.disconnect(connectedDevice.id);
    }
  };

  //   handlers
  const handleOnDiscoverPeripheral = (peripheral: Peripheral) => {
    console.log("handleOnDiscoverPeripheral", peripheral);
    if (!peripheral.name) {
      peripheral.name = "NO NAME";
    } else {
      addDevice(peripheral);
    }
  };

  const handleOnConnectPeripheral = async (peripheral: string) => {
    const peripheralDevice = allDevices.get(peripheral);
    if (peripheralDevice) {
      setConnectedDevice(peripheralDevice);
      await stopScanPeripherals();
    }
  };

  const handleOnStopScan = () => {
    setIsScanning(false);
  };

  const handleOnDisconnectPeripheral = (peripheral: string) => {
    const peripheralDevice = allDevices.get(peripheral);
    if (peripheralDevice) {
      setConnectedDevice(null);
    }
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
  };
}

export default useBLE;
