import { create } from "zustand";
import { roomSlice } from "./roomSlice";
import { bluetoothDeviceModuleSlice } from "./bluetoothDeviceModuleSlice";

export const useRoomsStore = create(roomSlice);
export const useBluetoothDeviceModuleStore = create(bluetoothDeviceModuleSlice);
