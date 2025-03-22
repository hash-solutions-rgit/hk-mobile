import React from "react";
import { Platform } from "react-native";

type Props = {
  children: React.ReactNode;
};

function BluetoothLayout({ children }: Props) {
  const askBluetoothPermissions = async () => {
    if (Platform.OS === "ios") {
      //ask for bluetooth permission for IOS
      const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
      if (result !== RESULTS.GRANTED) {
        //either permission is not granted or it's unavailable.
        if (result === RESULTS.UNAVAILABLE) {
          //if bluetooth is off, prompt user to enable the bluetooth manually.
          return { type: EPermissionTypes.enableBluetooth, value: false };
        } else {
          //if user denied for bluetooth permission, prompt them to enable it from settigs later.
          return { type: EPermissionTypes.bluetoothPermission, value: false };
        }
      }
      //bluetooth permission has been granted successfully
      return { type: EPermissionTypes.bluetoothPermission, value: true };
    } else {
      if (getPlatformVersion() > 30) {
        //ask for bluetooth permission for Android for version >= 12.
        if (
          (await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN)) !==
          RESULTS.GRANTED
        ) {
          return { type: EPermissionTypes.bluetoothPermission, value: false };
        }
        console.info("BLUETOOTH_SCAN permission allowed");
        if (
          (await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT)) !==
          RESULTS.GRANTED
        ) {
          return { type: EPermissionTypes.bluetoothPermission, value: false };
        }
        console.info("BLUETOOTH_CONNECT permission allowed");
        if (
          (await request(PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE)) !==
          RESULTS.GRANTED
        ) {
          return { type: EPermissionTypes.bluetoothPermission, value: false };
        }
        console.info("BLUETOOTH_ADVERTISE permission allowed");
        return { type: EPermissionTypes.bluetoothPermission, value: true };
      } else {
        //for android version < 12, no need of runtime permissions.
        return { type: EPermissionTypes.bluetoothPermission, value: true };
      }
    }
  };

  const handleBluetoothPermission = async () => {
    const isPermissionAllowed = await askBluetoothPermissions();
    if (isPermissionAllowed.value) {
      //Bluetooth permission allowed successfully
    } else {
      //Bluetooth permission denied. Show Bluetooth modal warning
      if (isPermissionAllowed.type === EPermissionTypes.bluetoothPermission) {
        //if user denied for bluetooth permission, prompt them to enable it from settigs later.
      } else {
        //For ios, if bluetooth is off, prompt user to enable the bluetooth manually by themselves.
      }
    }
  };
  return <>{children}</>;
}

export default BluetoothLayout;
