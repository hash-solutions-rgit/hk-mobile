
import { Device } from "react-native-ble-plx";
import type { StateCreator } from "zustand";

interface BluetoothDeviceModuleSlice {
  allDevices: Map<string, Device>;
  connectedDevice: Device | null;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  setAllDevices: (allDevices: Map<string, Device>) => void;
  setConnectedDevice: (connectedDevice: Device | null) => void;
  addDevice: (device: Device) => void;
  modelName: string;
  setModelName: (name: string) => void;
}

export const bluetoothDeviceModuleSlice: StateCreator<
  BluetoothDeviceModuleSlice
> = (set) => ({
  allDevices: new Map<string, Device>(),
  connectedDevice: null,
  isScanning: false,
  setIsScanning(isScanning) {
    set({ isScanning });
  },
  setAllDevices(allDevices) {
    set({ allDevices });
  },
  addDevice(device: Device) {
    set((state) => ({
      allDevices: new Map(state.allDevices.set(device.id, device)),
    }));
  },
  setConnectedDevice(connectedDevice) {
    set({ connectedDevice });
  },

  modelName: "",
  setModelName(name) {
    set({ modelName: name });
  },
});
