import { StateCreator } from "zustand";

interface PermissionSlice {
  isLocationPermitted: boolean;
  setIsLocationPermitted: (isLocationPermitted: boolean) => void;
}

export const permissionSlice: StateCreator<PermissionSlice> = (set) => ({
  isLocationPermitted: false,
  setIsLocationPermitted: (isLocationPermitted: boolean) => {
    set({ isLocationPermitted });
  },
});
