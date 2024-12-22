import { Alert, Linking, Platform } from "react-native";
import base64 from "react-native-base64";
import type { BleManager, Device } from "react-native-ble-plx";

class BluetoothModule {
  private static instance: BluetoothModule | null = null;

  // Private constructor to prevent instantiation from outside
  private constructor() {}
  private static DEVICE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  private static DEVICE_CHARACTERISTIC_UUID =
    "0000fff6-0000-1000-8000-00805f9b34fb";

  private static DEVICE_PASSWORD = "8f383838384f4b3031";

  // Public method to access the singleton instance
  public static getInstance(): BluetoothModule {
    if (this.instance === null) {
      this.instance = new BluetoothModule();
    }
    return this.instance;
  }

  /**
   * Verify the password of the device
   * @param device
   * @returns true if the password is correct, false otherwise
   */
  async verifyPassword(device: Device) {
    const base64Password = this.encodeHexToBase64(
      BluetoothModule.DEVICE_PASSWORD
    );

    try {
      await device.writeCharacteristicWithResponseForService(
        "0000fff0-0000-1000-8000-00805f9b34fb",
        "0000fff6-0000-1000-8000-00805f9b34fb",
        base64Password
      );

      return true;
    } catch (error) {
      console.log("FAILED TO CONNECT", error);
      return false;
    }
  }

  /**
   * Encode hex string to base64
   * @param hexData
   * @returns base64 encoded string
   */
  encodeHexToBase64(hexData: string) {
    // Convert hex string to byte array
    const byteArray = hexData
      ?.match(/.{1,2}/g)
      ?.map((byte) => parseInt(byte, 16));

    if (!byteArray) {
      throw new Error("byteArray is undefined");
    }

    // Convert byte array to Base64
    const base64Data = base64.encode(String.fromCharCode(...byteArray));

    return base64Data;
  }

  async checkBluetooth(bleManager: BleManager) {
    // For iOS, request permissions explicitly
    if (Platform.OS === "ios") {
      await bleManager.enable();
    }

    // Listen for Bluetooth state changes
    const subscription = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        console.log("Bluetooth is enabled");
      } else {
        this.promptToEnableBluetooth(bleManager);
      }
    }, true);

    // Cleanup the subscription on unmount
    return () => subscription.remove();
  }

  promptToEnableBluetooth(bleManager: BleManager) {
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
  }
}

export default BluetoothModule;
