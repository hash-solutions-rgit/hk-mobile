import "~/global.css";

import { SplashScreen, Stack } from "expo-router";
import CustomSplashScreen from "~/components/common/splashscreen";
import React, { useEffect } from "react";
import { PortalHost } from "@rn-primitives/portal";

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

  if (!appIsReady) {
    return null;
  }

  if (!splashDone && appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(root)/(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)/shop-now" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      <PortalHost />
    </>
  );
}
