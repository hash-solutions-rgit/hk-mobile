import { Peripheral } from "react-native-ble-manager";
import { StateCreator } from "zustand";

interface DeviceSlice {
  device: Peripheral | null;
  setDevice: (device: Peripheral) => void;

  isDeviceOn: boolean;
  setIsDeviceOn: (isDeviceOn: boolean) => void;
  toggleIsDeviceOn: () => void;
}

export const deviceSlice: StateCreator<DeviceSlice> = (set) => ({
  device: null,
  setDevice(device) {
    set({ device });
  },

  isDeviceOn: false,
  setIsDeviceOn(isDeviceOn) {
    set({ isDeviceOn });
  },
  toggleIsDeviceOn() {
    set((state) => ({ isDeviceOn: !state.isDeviceOn }));
  },
});
