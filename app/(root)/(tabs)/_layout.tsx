import { SafeAreaView, View } from "react-native";
import { Button } from "~/components/ui/button";
import { Menu } from "~/lib/icons/menu";
import { Tabs } from "expo-router";
import { House } from "~/lib/icons/house";
import { ShoppingBag } from "~/lib/icons/shopping-bag";
import { cn } from "~/lib/utils";
import { TabBar } from "~/components/common/tab-bar";

function Layout() {
  return (
    <SafeAreaView className="flex flex-col gap-y-2 flex-1">
      <View className="flex flex-row justify-between px-3 py-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center justify-center"
        >
          <Menu className="w-10 h-10 text-black" />
        </Button>
      </View>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",

            tabBarButton({}) {
              return (
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex items-center justify-center"
                >
                  <House className="w-10 h-10 text-black" />
                </Button>
              );
            },
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: "Shop Now",

            tabBarIcon: ({ focused }) => (
              <ShoppingBag
                className={cn(
                  "w-10 h-10",
                  focused ? "text-white" : "text-black"
                )}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default Layout;
