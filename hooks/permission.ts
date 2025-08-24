import { Platform } from "react-native";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { usePermissionStore } from "~/store";

const LOCATION_PERMISSION = {
  GIVEN: true,
  NOT_GIVEN: false,
} as const;

export const usePermission = () => {
  const { isLocationPermitted, setIsLocationPermitted } = usePermissionStore();

  const handleLocationPermission = async (): Promise<boolean> => {
    console.debug("Requesting location permission...");
    
    try {
      if (Platform.OS === "ios") {
        // For iOS, we need location permission for Bluetooth scanning
        const locationResult = await Promise.all([
          request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE),
          request(PERMISSIONS.IOS.LOCATION_ALWAYS).catch(() => RESULTS.DENIED), // Optional
        ]);
        
        const whenInUseResult = locationResult[0];
        const alwaysResult = locationResult[1];
        
        console.debug("iOS location permissions:", {
          whenInUse: whenInUseResult,
          always: alwaysResult
        });
        
        // We need at least "when in use" permission
        const isGranted = whenInUseResult === RESULTS.GRANTED || 
                         alwaysResult === RESULTS.GRANTED;
        
        setIsLocationPermitted(isGranted);
        
        if (!isGranted) {
          console.error("iOS location permission denied");
        }
        
        return isGranted;
        
      } else {
        // For Android, location permission is required for Bluetooth scanning
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        console.debug("Android location permission result:", result);
        
        const isGranted = result === RESULTS.GRANTED;
        setIsLocationPermitted(isGranted);
        
        if (!isGranted) {
          console.error("Android location permission denied");
        }
        
        return isGranted;
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setIsLocationPermitted(false);
      return false;
    }
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    console.debug("Checking current location permission status...");
    
    try {
      if (Platform.OS === "ios") {
        const whenInUseResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        const isGranted = whenInUseResult === RESULTS.GRANTED;
        setIsLocationPermitted(isGranted);
        return isGranted;
      } else {
        const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        const isGranted = result === RESULTS.GRANTED;
        setIsLocationPermitted(isGranted);
        return isGranted;
      }
    } catch (error) {
      console.error("Error checking location permission:", error);
      return false;
    }
  };

  return {
    handleLocationPermission,
    checkLocationPermission,
    isLocationPermitted,
  };
};