import { Platform } from "react-native";

export const isIos = () => {
  return Platform.OS === "ios";
};

export const isAndroid = () => {
  return Platform.OS === "android";
};

export const getPlatformVersion = () => {
  const version = Platform.Version;
  const major = parseInt(version.toString().split(".")[0], 10);
  const minor = parseInt(version.toString().split(".")[1], 10);
  return major * 10 + minor;
};
