import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  EmitterSubscription,
  EventSubscription,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import BleManager, { Peripheral } from "react-native-ble-manager";
import BluetoothModule from "~/utils/bluetooth-module";
import {
  handleLocationPermission as handleLocationPermissionService,
  handleBluetoothPermission as handleBluetoothPermissionService,
  enableBluetooth,
} from "~/utils/permissions";

type Props = {
  children: ReactNode;
};

interface IBluetoothContext {
  isBluetoothPermitted: boolean;
  isLocationPermitted: boolean;
  isBluetoothEnabled: boolean;
  allDevices: Peripheral[];
  devicesMap: Record<string, Peripheral>;
  connect: (deviceId: string) => Promise<boolean>;
  connectedDevice: Peripheral | null;
}

const initialBluetoothContext: IBluetoothContext = {
  isBluetoothPermitted: false,
  isLocationPermitted: false,
  isBluetoothEnabled: false,
  allDevices: [],
  devicesMap: {},
  connectedDevice: null,
  connect: (deviceId: string) => Promise.resolve(false),
};
const BluetoothContext = createContext(initialBluetoothContext);

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SECONDS_TO_SCAN = 6;
const ALLOW_DUPLICATE = false;
const MAX_CONNECT_WAITING_PERIOD = 30000;
const DEVICE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const DEVICE_CHARACTERISTIC_UUID = "0000fff6-0000-1000-8000-00805f9b34fb";
const SERVICE_UUIDS: string[] = [DEVICE_SERVICE_UUID];

const DEVICE_PASSWORD = "8f383838384f4b3031";

function BluetoothLayout({ children }: Props) {
  const [isBluetoothPermitted, setIsBluetoothPermitted] = useState(false);
  const [isLocationPermitted, setIsLocationPermitted] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [devicesMap, setDevicesMap] = useState<Record<string, Peripheral>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Peripheral | null>(
    null
  );

  const allDevices = useMemo(() => Object.values(devicesMap), [devicesMap]);

  const scanNearbyDevices = async (): Promise<void> => {
    console.log("scanNearbyDevices");
    let listeners: EventSubscription[] = [];

    const onBleManagerDiscoverPeripheral = (peripheral: Peripheral) => {
      console.log("Device Discovered", peripheral);
      if (peripheral.id && peripheral.name) {
        setDevicesMap((prev) => ({ ...prev, [peripheral.id]: peripheral }));
      }
    };

    const onBleManagerStopScan = () => {
      for (const listener of listeners) {
        listener.remove();
      }
    };

    try {
      listeners = [
        BleManager.onDiscoverPeripheral(onBleManagerDiscoverPeripheral),

        BleManager.onStopScan(onBleManagerStopScan),
      ];

      console.log("Scanning for peripherals");
      await BleManager.scan(
        SERVICE_UUIDS,
        SECONDS_TO_SCAN,
        ALLOW_DUPLICATE,
        {}
      ).then(() => {
        console.log("Scanning completed");
      });
    } catch (error) {
      console.error("Error while scanning for peripherals", error);
    }
  };

  const isDeviceConnected = async (deviceId: string) => {
    return await BleManager.isPeripheralConnected(deviceId, []);
  };

  const connect = (deviceId: string): Promise<boolean> => {
    let connectedDeviceId: string | null = null;
    return new Promise<boolean>(async (resolve, reject) => {
      let failedToConnectTimer: NodeJS.Timeout;

      //For android always ensure to enable the bluetooth again before connecting.
      const isEnabled = await enableBluetooth();
      if (!isEnabled) {
        //if blutooth is somehow off, first prompt user to turn on the bluetooth
        return resolve(false);
      }

      //before connecting, ensure if app is already connected to device or not.
      let isConnected = await isDeviceConnected(deviceId);

      if (!isConnected) {
        //if not connected already, set the timer such that after some time connection process automatically stops if its failed to connect.
        failedToConnectTimer = setTimeout(() => {
          return resolve(false);
        }, MAX_CONNECT_WAITING_PERIOD);

        await BleManager.connect(deviceId).then(() => {
          //if connected successfully, stop the previous set timer.
          clearTimeout(failedToConnectTimer);
        });
        isConnected = await isDeviceConnected(deviceId);
      }

      if (!isConnected) {
        //now if its not connected somehow, just close the process.
        return resolve(false);
      } else {
        //Connection success
        connectedDeviceId = deviceId;

        //get the services and characteristics information for the connected hardware device.
        const peripheralInformation =
          await BleManager.retrieveServices(deviceId);

        /**
         * Check for supported services and characteristics from device info
         */
        const deviceSupportedServices = (
          peripheralInformation.services || []
        ).map((item) => item?.uuid?.toUpperCase());
        const deviceSupportedCharacteristics = (
          peripheralInformation.characteristics || []
        ).map((_char) => _char.characteristic.toUpperCase());
        if (
          !deviceSupportedServices.includes(DEVICE_SERVICE_UUID) ||
          !deviceSupportedCharacteristics.includes(DEVICE_CHARACTERISTIC_UUID)
        ) {
          //if required service ID and Char ID is not supported by hardware, close the connection.
          isConnected = false;
          await BleManager.disconnect(connectedDeviceId);
          return reject(
            "Connected device does not have required service and characteristic."
          );
        }

        await BleManager.startNotification(
          deviceId,
          DEVICE_SERVICE_UUID,
          DEVICE_CHARACTERISTIC_UUID
        )
          .then((response) => {
            console.log(
              "Started notification successfully on ",
              DEVICE_CHARACTERISTIC_UUID
            );
          })
          .catch(async () => {
            isConnected = false;
            if (!connectedDeviceId) {
              return reject(
                "Failed to start notification on required service and characteristic."
              );
            }
            await BleManager.disconnect(connectedDeviceId);
            return reject(
              "Failed to start notification on required service and characteristic."
            );
          });

        let disconnectListener = bleManagerEmitter.addListener(
          "BleManagerDisconnectPeripheral",
          async () => {
            //addd the code to execute after hardware disconnects.
            if (connectedDeviceId) {
              await BleManager.disconnect(connectedDeviceId);
            }
            disconnectListener.remove();
          }
        );

        return resolve(isConnected);
      }
    });
  };

  const hexToByteArray = (hex: string): number[] => {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal string");
    }

    const byteArray: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      byteArray.push(parseInt(hex.substr(i, 2), 16));
    }
    return byteArray;
  };

  const verifyPassword = async (peripheralId: Peripheral["id"]) => {
    const byteArray = hexToByteArray(DEVICE_PASSWORD);
    try {
      await BleManager.write(
        peripheralId,
        DEVICE_SERVICE_UUID,
        DEVICE_CHARACTERISTIC_UUID,
        byteArray
      );

      return true;
    } catch (error) {
      console.debug("FAILED TO Verify the device", error);
      return false;
    }
  };

  const handleBluetoothPermission = async () => {
    const result = await handleBluetoothPermissionService();
    if (result) {
      setIsBluetoothPermitted(result);
    }
  };

  const handleLocationPermission = async () => {
    const result = await handleLocationPermissionService();
    setIsLocationPermitted(result);
  };

  const handleEnableBluetooth = async () => {
    const result = await enableBluetooth();
    console.log("handleEnableBluetooth", result);
    if (result) {
      setIsBluetoothEnabled(result);
    }
  };

  const handleBleSetup = async () => {
    try {
      await BleManager.start({ showAlert: false })
        .then(() => console.debug("BleManager started."))
        .catch((error: any) =>
          console.error("BeManager could not be started.", error)
        );

      await BleManager.scan(
        SERVICE_UUIDS,
        SECONDS_TO_SCAN,
        ALLOW_DUPLICATE,
        {}
      ).then(() => {
        console.log("Scanning completed");
      });
    } catch (error) {
      console.error("unexpected error starting BleManager.", error);
      return;
    }

    const onBleManagerDiscoverPeripheral = (peripheral: Peripheral) => {
      console.log("Device Discovered", peripheral);
      if (peripheral.id && peripheral.name) {
        setDevicesMap((prev) => ({ ...prev, [peripheral.id]: peripheral }));
      }
    };

    const onBleManagerStopScan = () => {
      for (const listener of listeners) {
        listener.remove();
      }
    };

    const listeners = [
      BleManager.onDiscoverPeripheral(onBleManagerDiscoverPeripheral),
      BleManager.onStopScan(onBleManagerStopScan),
      // BleManager.onStopScan(handleOnStopScan),
      // BleManager.onDisconnectPeripheral(handleOnDisconnectPeripheral),
      // BleManager.onDidUpdateValueForCharacteristic(
      //   handleOnDidUpdateValueForCharacteristic
      // ),
    ];

    return () => {
      console.debug("[app] main component unmounting. Removing listeners...");
      for (const listener of listeners) {
        listener.remove();
      }
    };
  };

  useEffect(() => {
    if (isLocationPermitted) {
      void handleBluetoothPermission();
      return;
    }

    void handleLocationPermission();
  }, [isLocationPermitted]);

  useEffect(() => {
    if (isBluetoothPermitted) {
      void handleEnableBluetooth();
      return;
    }
    void handleBluetoothPermission();
  }, [isBluetoothPermitted]);

  useEffect(() => {
    console.log("isBluetoothEnabled", isBluetoothEnabled);
    console.log("isBluetoothPermitted", isBluetoothPermitted);
    if (!isBluetoothEnabled || !isBluetoothPermitted) {
      return;
    }
    void handleBleSetup();
  }, [isBluetoothPermitted, isLocationPermitted, isBluetoothEnabled]);

  return (
    <BluetoothContext.Provider
      value={{
        isBluetoothPermitted,
        isLocationPermitted,
        isBluetoothEnabled,
        allDevices,
        devicesMap,
        connect,
        connectedDevice,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
}

export const useBluetooth = () => useContext(BluetoothContext);

export default BluetoothLayout;
