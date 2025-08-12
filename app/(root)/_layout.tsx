import { SplashScreen, Stack,Slot } from "expo-router";

function Layout() {
  return (
          <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shop-now" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack> 
  )
}

export default Layout