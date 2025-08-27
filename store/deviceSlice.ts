
import { Device } from "react-native-ble-plx";
import { StateCreator } from "zustand";

interface DeviceSlice {
  device: Device | null;
  setDevice: (device: Device) => void;

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
