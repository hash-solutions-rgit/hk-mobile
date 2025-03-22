import { promptForEnableLocationIfNeeded } from "react-native-android-location-enabler";

export const useGPS = () => {
  const askGPSPermission = async () => {
    //prompt to enable gps
    try {
      await promptForEnableLocationIfNeeded();
      /*
      Here now the user has accepted to enable the location services
      data can be :
       - "already-enabled" if the location services has been already enabled
       - "enabled" if user has clicked on OK button in the popup
      */
      return {
        enabled: true,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        /*
        The user has not accepted to enable the location services
        OR something went wrong during the process
        "err" : { "code" : "ERR00|ERR01|ERR02|ERR03", "message" : "message"}
        codes :
         - ERR00 : The user has clicked on Cancel button in the popup
         - ERR01 : If the Settings change are unavailable
         - ERR02 : If the popup has failed to open
         - ERR03 : Internal error
        */
        return {
          enabled: false,
          code: error.message,
        };
      }
    }
  };

  const handleGPSPermission = async () => {
    //ask for GPS permission
    const result = await askGPSPermission();
    if (result?.enabled) {
      //GPS enabled successfully, display next permission
    } else {
      //GPS couldn't be enabled. Show GPS modal warning
      if (result?.code === "ERR00") {
        //The user has clicked on Cancel button in the popup
        //show the pemission denied popup or ask them to manually enable the gps
        return;
      } else {
        //something went wrong, prompt user to manually enable the GPS from his side from settings as our attempt failed
      }
    }
  };

  return {
    askGPSPermission,
    handleGPSPermission,
  };
};
