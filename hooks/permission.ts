import { Platform } from "react-native";
import { PERMISSIONS, RESULTS, request } from "react-native-permissions";
import { usePermissionStore } from "~/store";

const LOCATION_PERMISSION = {
  GIVEN: true,
  NOT_GIVEN: false,
} as const;

export const usePermission = () => {
  const { isLocationPermitted, setIsLocationPermitted } = usePermissionStore();

  const handleLocationPermission = async () => {
    if (Platform.OS === "ios") {
      //ask for location permissions for IOS
      const locationResult = await Promise.all([
        request(PERMISSIONS.IOS.LOCATION_ALWAYS),
        request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE),
      ]);
      let resultAlways = locationResult?.[0];
      let resultWhenInUse =
        locationResult.length > 1 ? locationResult[1] : null;
      const isResultAlwaysDenied = () => {
        if (
          resultAlways === RESULTS.BLOCKED ||
          resultAlways === RESULTS.UNAVAILABLE ||
          resultAlways === RESULTS.DENIED
        ) {
          return true;
        } else {
          return false;
        }
      };
      const isResultWhenInUseDenied = () => {
        if (
          resultWhenInUse === RESULTS.BLOCKED ||
          resultWhenInUse === RESULTS.UNAVAILABLE ||
          resultWhenInUse === RESULTS.DENIED
        ) {
          return true;
        } else {
          return false;
        }
      };
      if (isResultAlwaysDenied() && isResultWhenInUseDenied()) {
        //user hasn't allowed location
        setIsLocationPermitted(LOCATION_PERMISSION.NOT_GIVEN);
      } else {
        //user has allowed location
        setIsLocationPermitted(LOCATION_PERMISSION.GIVEN);
      }
    } else {
      //ask for location permissions for Android
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      setIsLocationPermitted(result === RESULTS.GRANTED);
    }
  };

  return {
    handleLocationPermission,
    isLocationPermitted,
  };
};
