import { useEffect, useRef } from "react";
import { Alert, Linking, PermissionsAndroid, Platform } from "react-native";
import bleManager, { Peripheral } from "react-native-ble-manager";

import * as ExpoDevice from "expo-device";

import BluetoothModule from "~/utils/bluetooth-module";
import { useBluetoothDeviceModuleStore } from "~/store";

import { models } from "~/constants/models-features";
import { usePermission } from "./permission";
import { PERMISSIONS, request, RESULTS } from "react-native-permissions";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<void>;
  stopScanPeripherals(): Promise<void>;
  connectToDevice: (deviceId: Peripheral) => Promise<void>;
  disconnectFromDevice: (boolean?: boolean) => void;
  connectedDevice: Peripheral | null;
  allDevices: Map<string, Peripheral>;
  checkBluetooth: () => Promise<void>;
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
    setModelName,
  } = useBluetoothDeviceModuleStore();
  const bluetoothModule = BluetoothModule.getInstance();
  const { handleLocationPermission, isLocationPermitted } = usePermission();

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

  const requestBluetoothFallback = async () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:Bluetooth");
    } else {
      Linking.sendIntent("android.settings.BLUETOOTH_SETTINGS");
    }
  };

  const requestPermissions = async () => {
    await handleLocationPermission();
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
    } else if (Platform.OS === "ios") {
      const result = await request(PERMISSIONS.IOS.BLUETOOTH);
      if (result === RESULTS.GRANTED) {
        console.debug("Bluetooth permission granted");
        return true;
      }
      return false;
    } else {
      return true;
    }
  };

  const isDuplicteDevice = (devices: Peripheral[], nextDevice: Peripheral) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  const scanForPeripherals = async () => {
    setIsScanning(true);
    console.debug(
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
      await bluetoothModule.setModelNumber(device.id);
    } catch (error) {
      console.error("Error while connecting", error);
    }
  };

  const disconnectFromDevice = async (force = false) => {
    if (connectedDevice) {
      await bluetoothModule.startStopDevice(connectedDevice.id, force);
      await bleManager.disconnect(connectedDevice.id);
      setModelName("");
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
  const handleOnDidUpdateValueForCharacteristic = (data: {
    characteristic: string;
    peripheral: string;
    service: string;
    value: number[];
  }) => {
    const str = data.value.map((byte) => String.fromCharCode(byte)).join("");
    if (models.includes(str)) {
      setModelName(str);
      bluetoothModule.modelNumber = str;
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

  const handleIOSPermissions = async () => {
    if (Platform.OS === "ios") {
      const result = await request(PERMISSIONS.IOS.BLUETOOTH);
      if (result === RESULTS.GRANTED) {
        console.debug("Bluetooth permission granted");
      } else {
        Alert.alert(
          "Permission Denied",
          "Bluetooth is required for device connectivity."
        );
      }
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
    handleAndroidPermissions();
    handleIOSPermissions();
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
      bleManager.onDidUpdateValueForCharacteristic(
        handleOnDidUpdateValueForCharacteristic
      ),
    ];

    return () => {
      console.debug("[app] main component unmounting. Removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isLocationPermitted) {
      requestPermissions();
    }
  }, [isLocationPermitted]);

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
