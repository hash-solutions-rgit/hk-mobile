import type { Peripheral } from "react-native-ble-manager";
import BleManager from "react-native-ble-manager";

class BluetoothModule {
  private static instance: BluetoothModule | null = null;

  // Private constructor to prevent instantiation from outside
  private constructor() {}
  private static _DEVICE_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
  private static _DEVICE_CHARACTERISTIC_UUID =
    "0000fff6-0000-1000-8000-00805f9b34fb";
  private _modelNumber: string | null = null;

  private static DEVICE_PASSWORD = "8f383838384f4b3031";

  // Public method to access the singleton instance
  public static getInstance(): BluetoothModule {
    if (this.instance === null) {
      this.instance = new BluetoothModule();
    }
    return this.instance;
  }

  get DEVICE_SERVICE_UUID() {
    return BluetoothModule._DEVICE_SERVICE_UUID;
  }

  get DEVICE_CHARACTERISTIC_UUID() {
    return BluetoothModule._DEVICE_CHARACTERISTIC_UUID;
  }

  set modelNumber(modelNumber: string | null) {
    this._modelNumber = modelNumber;
  }

  get modelNumber() {
    return this._modelNumber;
  }

  /**
   * Verify the password of the device
   * @param device
   * @returns true if the password is correct, false otherwise
   */

  hexToByteArray(hex: string): number[] {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal string");
    }

    const byteArray: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      byteArray.push(parseInt(hex.substr(i, 2), 16));
    }
    return byteArray;
  }

  async startStopDevice(peripheralId: Peripheral["id"], isDeviceOn: boolean) {
    const byteArray = this.hexToByteArray(!isDeviceOn ? "2d0000" : "2d0101");
    try {
      await BleManager.write(
        peripheralId,
        BluetoothModule._DEVICE_SERVICE_UUID,
        BluetoothModule._DEVICE_CHARACTERISTIC_UUID,
        byteArray
      );

      return true;
    } catch (error) {
      console.debug("FAILED TO Start or Stop Device", error);
      return false;
    }
  }

  /**
   * Encode hex string to base64
   * @param hexData
   * @returns base64 encoded string
   */
  encodeHexToByteArray(hexData: string) {
    // Convert hex string to byte array
    const byteArray = hexData
      ?.match(/.{1,2}/g)
      ?.map((byte) => parseInt(byte, 16));

    if (!byteArray) {
      throw new Error("byteArray is undefined");
    }

    return byteArray;
  }

  async enableBluetooth() {
    try {
      console.debug("[enableBluetooth] enabling bluetooth");
      await BleManager.enableBluetooth();
      console.debug("[enableBluetooth] enabled bluetooth");
    } catch (error) {
      console.error("[enableBluetooth] thrown", error);
    }
  }

  async checkBluetooth() {
    await this.enableBluetooth();
  }

  async adjustIntensity(peripheralId: Peripheral["id"], intensity: number) {
    try {
      const hexIntensity = intensity.toString(16);
      const byteArray = this.encodeHexToByteArray(
        `2A0102010101030000173b3E00${hexIntensity.padStart(2, "0")}000A0064`
      );
      await BleManager.write(
        peripheralId,
        this.DEVICE_SERVICE_UUID,
        this.DEVICE_CHARACTERISTIC_UUID,
        byteArray
      );
    } catch (error) {
      console.error("Failed to adjust intensity", error);
    }
  }

  async setModelNumber(peripheralId: string) {
    await BleManager.startNotification(
      peripheralId,
      BluetoothModule._DEVICE_SERVICE_UUID,
      BluetoothModule._DEVICE_CHARACTERISTIC_UUID
    );

    await BleManager.write(
      peripheralId,
      BluetoothModule._DEVICE_SERVICE_UUID,
      BluetoothModule._DEVICE_CHARACTERISTIC_UUID,
      this.encodeHexToByteArray("45")
    );

    await BleManager.stopNotification(
      peripheralId,
      BluetoothModule._DEVICE_SERVICE_UUID,
      BluetoothModule._DEVICE_CHARACTERISTIC_UUID
    );
  }

  //   promptToEnableBluetooth(bleManager: BleManager) {
  //     Alert.alert(
  //       "Enable Bluetooth",
  //       "Bluetooth is required to connect to devices. Please turn it on.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         {
  //           text: "Open Settings",
  //           onPress: () => {
  //             if (Platform.OS === "ios") {
  //               // Open iOS settings
  //               Linking.openURL("App-Prefs:Bluetooth");
  //             } else {
  //               // Open Android settings
  //               bleManager.enable(); // Tries to enable Bluetooth on Android
  //             }
  //           },
  //         },
  //       ]
  //     );
  //   }
}

export default BluetoothModule;
