import { Slot } from "expo-router";
import { View, ScrollView } from "react-native";
import { Button } from "~/components/ui/button";
import { Menu } from "~/lib/icons/menu";

function Layout() {
  return (
    <View className="flex flex-col gap-y-2 flex-1">
      <View className="flex flex-row justify-between px-3 py-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="flex items-center justify-center"
        >
          <Menu className="w-10 h-10 text-black" />
        </Button>
      </View>
      <Slot />
    </View>
  );
}

export default Layout;
