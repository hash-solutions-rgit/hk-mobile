import { BleManager } from 'react-native-ble-plx'


// make a singleton instance of BleManager
export class BLEServiceInstance {
  manager: BleManager

  constructor() {
    this.manager = new BleManager()
  }

  getManager() {
    return this.manager
  }
}
