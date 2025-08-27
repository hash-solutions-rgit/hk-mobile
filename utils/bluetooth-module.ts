import { BleManager } from 'react-native-ble-plx'

class BluetoothModule {
  private static instance: BluetoothModule | null = null;
   private manager: BleManager

  // Private constructor to prevent instantiation from outside
  private constructor() {
    this.manager = new BleManager()
  }
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

  getManager() {
    return this.manager
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
  async verifyPassword(peripheralId: string) {
    const value = this.hexToBase64(BluetoothModule.DEVICE_PASSWORD);
    try {
      await this.manager.writeCharacteristicWithResponseForDevice(
        peripheralId,
        BluetoothModule._DEVICE_SERVICE_UUID,
        BluetoothModule._DEVICE_CHARACTERISTIC_UUID,
        value
      );

      return true;
    } catch (error) {
      console.debug("FAILED TO Verify the device", error);
      return false;
    }
  }

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

  hexToBase64(hex: string): string {
       if (hex.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal string");
    }
    return Buffer.from(hex, "hex").toString("base64");
  }

  async startStopDevice(peripheralId: string, isDeviceOn: boolean) {
    const value = this.hexToBase64(!isDeviceOn ? "2d0000" : "2d0101");
    try {
      await this.manager.writeCharacteristicWithResponseForDevice(
        peripheralId,
        BluetoothModule._DEVICE_SERVICE_UUID,
        BluetoothModule._DEVICE_CHARACTERISTIC_UUID,
        value
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
      await this.manager.enable();
      console.debug("[enableBluetooth] enabled bluetooth");
    } catch (error) {
      console.error("[enableBluetooth] thrown", error);
    }
  }

  async checkBluetooth() {
    await this.enableBluetooth();
  }

  async adjustIntensity(peripheralId: string, intensity: number) {
    try {
      const hexIntensity = intensity.toString(16);
      const byteArray = this.hexToBase64(
        `2A0102010101030000173b3E00${hexIntensity.padStart(2, "0")}000A0064`
      );
      await this.manager.writeCharacteristicWithResponseForDevice(
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

    await this.manager.writeCharacteristicWithResponseForDevice(
      peripheralId,
      BluetoothModule._DEVICE_SERVICE_UUID,
      BluetoothModule._DEVICE_CHARACTERISTIC_UUID,
      this.hexToBase64("45")
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
