import { Platform } from "react-native";

export const isIos = () => {
  return Platform.OS === "ios";
};

export const isAndroid = () => {
  return Platform.OS === "android";
};

export const getPlatformVersion = () => {
  const version = Platform.Version;
  if (typeof version === "string") {
    const [majorStr, minorStr = "0"] = version.split(".");
    const major = parseInt(majorStr, 10);
    const minor = parseInt(minorStr, 10);
    return major * 10 + minor;
  }
  return version;
};
