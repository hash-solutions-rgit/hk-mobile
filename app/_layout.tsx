import "~/global.css";

import { SplashScreen, Stack,Slot } from "expo-router";
import CustomSplashScreen from "~/components/common/splashscreen";
import React, { useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        // await Font.loadAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  React.useEffect(() => {
    if (!appIsReady) return;
    SplashScreen.hide();
    setTimeout(() => {
      setSplashDone(true);
    }, 5000);
  }, [appIsReady]);

  if (!appIsReady || !splashDone) {
    return <CustomSplashScreen />;
  }

  return (
    

    <>

      <Slot/>
      <PortalHost />
    </>
  );
}
