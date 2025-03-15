import { create } from "zustand";
import { roomSlice } from "./roomSlice";
import { bluetoothDeviceModuleSlice } from "./bluetoothDeviceModuleSlice";
import { deviceSlice } from "./deviceSlice";
import { tabsSlice } from "./tabsSlice";
import { permissionSlice } from "./permission";

export const useRoomsStore = create(roomSlice);
export const useBluetoothDeviceModuleStore = create(bluetoothDeviceModuleSlice);

export const useDeviceStore = create(deviceSlice);

export const usePermissionStore = create(permissionSlice);
