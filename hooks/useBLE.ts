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
  disconnectFromDevice: (force?: boolean) => Promise<void>;
  connectedDevice: Peripheral | null;
  allDevices: Map<string, Peripheral>;
  checkBluetooth: () => Promise<void>;
  renameDevice: (name: string) => Promise<void>;
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
    try {
      const state = await bleManager.checkState();
      console.debug("Bluetooth state:", state);
      
      if (state !== 'on') {
        if (Platform.OS === 'android') {
          try {
            await bleManager.enableBluetooth();
            console.debug("Bluetooth enabled successfully");
          } catch (error) {
            console.error("Failed to enable Bluetooth:", error);
            throw new Error("Please enable Bluetooth manually");
          }
        } else {
          throw new Error("Please enable Bluetooth in Settings");
        }
      }
    } catch (error) {
      console.error("Bluetooth check failed:", error);
      throw error;
    }
  };

  const sendHeartBeat = (deviceId: Peripheral["id"]) => {
    if (heartBeatTimer.current) {
      clearTimeout(heartBeatTimer.current);
    }
    
    heartBeatTimer.current = setTimeout(() => {
      bleManager.writeWithoutResponse(
        deviceId,
        bluetoothModule.DEVICE_SERVICE_UUID,
        bluetoothModule.DEVICE_CHARACTERISTIC_UUID,
        bluetoothModule.hexToByteArray("e0aa55")
      ).catch(error => {
        console.error("Heartbeat failed:", error);
      });
    }, 5000);
  };

  const requestAndroid31Permissions = async () => {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(results).every(
        result => result === PermissionsAndroid.RESULTS.GRANTED
      );

      console.debug("Android 12+ permissions:", results);
      return allGranted;
    } catch (error) {
      console.error("Error requesting Android 12+ permissions:", error);
      return false;
    }
  };

  const requestBluetoothFallback = async () => {
    if (Platform.OS === "ios") {
      Linking.openURL("App-Prefs:Bluetooth");
    } else {
      Linking.sendIntent("android.settings.BLUETOOTH_SETTINGS");
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    console.debug("Requesting permissions...");
    
    try {
      if (Platform.OS === "android") {
        if ((ExpoDevice.platformApiLevel ?? -1) >= 31) {
          return await requestAndroid31Permissions();
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message: "Bluetooth scanning requires location permission",
              buttonPositive: "OK",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else if (Platform.OS === "ios") {
        const result = await request(PERMISSIONS.IOS.BLUETOOTH);
        console.debug("iOS Bluetooth permission result:", result);
        return result === RESULTS.GRANTED;
      } else {
        return true;
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  const scanForPeripherals = async (): Promise<void> => {
    try {
      console.debug("Starting scan for peripherals...");
      
      // Stop any ongoing scan first
      await bleManager.stopScan().catch(() => {});
      
      // Check Bluetooth state
      await checkBluetooth();
      
      // Request permissions
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        throw new Error("Permissions not granted");
      }
      
      // Clear previous devices and set scanning state
      setAllDevices(new Map());
      setIsScanning(true);
      
      console.debug("Service UUID:", bluetoothModule.DEVICE_SERVICE_UUID);
      
      // Start scanning - use empty array to find all devices
      await bleManager.scan([], 10, false, {});
      console.debug("Scan started successfully");
      
    } catch (error:any) {
      console.error("Error starting scan:", error);
      setIsScanning(false);
      
      if (error.message?.includes("Bluetooth")) {
        Alert.alert("Bluetooth Required", "Please enable Bluetooth to scan for devices", [
          { text: "Cancel" },
          { text: "Settings", onPress: requestBluetoothFallback }
        ]);
      } else if (error.message?.includes("Permission")) {
        Alert.alert("Permission Required", "Bluetooth and location permissions are required", [
          { text: "Cancel" },
          { text: "Retry", onPress: () => requestPermissions() }
        ]);
      } else {
        Alert.alert("Scan Error", `Failed to start scanning: ${error.message}`);
      }
      
      throw error;
    }
  };

  const stopScanPeripherals = async (): Promise<void> => {
    try {
      await bleManager.stopScan();
      setIsScanning(false);
      console.debug("Scan stopped");
    } catch (error) {
      console.error("Error stopping scan:", error);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: Peripheral): Promise<void> => {
    console.debug("Attempting to connect to device:", device.name, device.id);
    
    try {
      // Stop scanning first
      await stopScanPeripherals();
      
      // Check if already connected
      const isConnected = await bleManager.isPeripheralConnected(device.id, []);
      if (isConnected) {
        console.debug("Device already connected");
        setConnectedDevice(device);
        return;
      }

      console.debug("Connecting to device...");
      await bleManager.connect(device.id);
      console.debug("Connected successfully");

      console.debug("Retrieving services...");
      const services = await bleManager.retrieveServices(device.id);
      console.debug("Services retrieved:", services.services?.map(s => s.uuid));

      console.debug("Verifying password...");
      const passwordVerified = await bluetoothModule.verifyPassword(device.id);
      if (!passwordVerified) {
        throw new Error("Password verification failed - device may not be compatible");
      }
      console.debug("Password verified");

      console.debug("Setting model number...");
      await bluetoothModule.setModelNumber(device.id);
      console.debug("Model number set");

      setConnectedDevice(device);
      sendHeartBeat(device.id);
      console.debug("Device connection completed successfully");
      
    } catch (error:any) {
      console.error("Error while connecting:", error);
      
      // Try to disconnect if there was an error
      try {
        await bleManager.disconnect(device.id);
      } catch (disconnectError) {
        console.error("Error disconnecting after failed connection:", disconnectError);
      }
      
      Alert.alert(
        "Connection Error", 
        `Failed to connect to ${device.name}:\n${error.message}`
      );
      throw error;
    }
  };

  const disconnectFromDevice = async (force = false): Promise<void> => {
    if (connectedDevice) {
      try {
        console.debug("Disconnecting from device...");
        
        // Clear heartbeat
        if (heartBeatTimer.current) {
          clearTimeout(heartBeatTimer.current);
          heartBeatTimer.current = null;
        }
        
        // Stop device if needed
        await bluetoothModule.startStopDevice(connectedDevice.id, force);
        
        // Disconnect
        await bleManager.disconnect(connectedDevice.id);
        
        // Clear state
        setConnectedDevice(null);
        setModelName("");
        
        console.debug("Disconnected successfully");
      } catch (error) {
        console.error("Error disconnecting:", error);
        // Still clear the state even if disconnect failed
        setConnectedDevice(null);
        setModelName("");
      }
    }
  };

  // Event handlers
  const handleOnDiscoverPeripheral = (peripheral: Peripheral) => {
    console.debug("Discovered peripheral:", {
      name: peripheral.name || "NO NAME",
      id: peripheral.id,
      rssi: peripheral.rssi
    });
    
    // Add all discovered devices for debugging
    if (peripheral.id) {
      // Set a default name if none exists
      if (!peripheral.name || peripheral.name.trim() === '') {
        peripheral.name = `Unknown Device`;
      }
      addDevice(peripheral);
      console.debug("Added device to store");
    }
  };

  const handleOnConnectPeripheral = async (peripheral: {
    peripheral: string;
    status: number;
  }) => {
    console.debug("Peripheral connected event:", peripheral);
    const peripheralDevice = allDevices.get(peripheral.peripheral);
    if (peripheralDevice && peripheral.status === 0) {
      setConnectedDevice(peripheralDevice);
      sendHeartBeat(peripheral.peripheral);
    }
  };

  const handleOnStopScan = () => {
    console.debug("Scan stopped event");
    setIsScanning(false);
  };

  const handleOnDisconnectPeripheral = (peripheral: {
    peripheral: string;
    status: number;
  }) => {
    console.debug("Peripheral disconnected event:", peripheral);
    
    if (connectedDevice?.id === peripheral.peripheral) {
      setConnectedDevice(null);
      setModelName("");
      
      if (heartBeatTimer.current) {
        clearTimeout(heartBeatTimer.current);
        heartBeatTimer.current = null;
      }
    }
  };
  
  const handleOnDidUpdateValueForCharacteristic = (data: {
    characteristic: string;
    peripheral: string;
    service: string;
    value: number[];
  }) => {
    console.debug("Characteristic value updated:", data);
    const str = data.value.map((byte) => String.fromCharCode(byte)).join("");
    console.debug("Received string:", str);
    
    if (models.includes(str)) {
      console.debug("Model detected:", str);
      setModelName(str);
      bluetoothModule.modelNumber = str;
    }
  };

  const renameDevice = async (name: string): Promise<void> => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }
    
    try {
      const hexString = stringToHex(name);
      const byteData = bluetoothModule.hexToByteArray("22" + hexString);
      await bleManager.write(
        connectedDevice.id,
        bluetoothModule.DEVICE_SERVICE_UUID,
        bluetoothModule.DEVICE_CHARACTERISTIC_UUID,
        byteData
      );
      console.debug("Device renamed successfully");
    } catch (error) {
      console.error("Error renaming device:", error);
      throw error;
    }
  };

  const stringToHex = (str: string): string => {
    let hexString = "";
    for (let i = 0; i < str.length; i++) {
      const hex = str.charCodeAt(i).toString(16).padStart(2, '0');
      hexString += hex;
    }
    return hexString;
  };

  // Initialize BLE Manager and set up listeners
  useEffect(() => {
    let mounted = true;
    
    const initializeBLE = async () => {
      console.debug("Initializing BLE Manager...");
      
      try {
        // Start BLE Manager
        await bleManager.start({ showAlert: false });
        console.debug("BleManager started successfully");
        
        if (!mounted) return;

        // Set up event listeners
        const listeners = [
          bleManager.onDiscoverPeripheral(handleOnDiscoverPeripheral),
          bleManager.onConnectPeripheral(handleOnConnectPeripheral),
          bleManager.onStopScan(handleOnStopScan),
          bleManager.onDisconnectPeripheral(handleOnDisconnectPeripheral),
          bleManager.onDidUpdateValueForCharacteristic(handleOnDidUpdateValueForCharacteristic),
        ];

        console.debug("BLE event listeners set up");

        // Cleanup function
        return () => {
          console.debug("Cleaning up BLE listeners...");
          listeners.forEach(listener => listener.remove());
        };
        
      } catch (error) {
        console.error("Failed to initialize BLE Manager:", error);
      }
    };

    const cleanup = initializeBLE();

    return () => {
      mounted = false;
      
      // Clear heartbeat timer
      if (heartBeatTimer.current) {
        clearTimeout(heartBeatTimer.current);
      }
      
      // Execute cleanup if available
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => cleanupFn?.());
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