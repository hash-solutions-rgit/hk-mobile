import type { Peripheral } from "react-native-ble-manager";
import type { StateCreator } from "zustand";

interface BluetoothDeviceModuleSlice {
  allDevices: Map<string, Peripheral>;
  connectedDevice: Peripheral | null;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
  setAllDevices: (allDevices: Map<string, Peripheral>) => void;
  setConnectedDevice: (connectedDevice: Peripheral | null) => void;
  addDevice: (device: Peripheral) => void;
  modelName: string;
  setModelName: (name: string) => void;
}

export const bluetoothDeviceModuleSlice: StateCreator<
  BluetoothDeviceModuleSlice
> = (set) => ({
  allDevices: new Map<string, Peripheral>(),
  connectedDevice: null,
  isScanning: false,
  setIsScanning(isScanning) {
    set({ isScanning });
  },
  setAllDevices(allDevices) {
    set({ allDevices });
  },
  addDevice(device: Peripheral) {
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
