import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { View } from "react-native";
import AddRoom from "~/components/home/add-room";
import { useRoomsStore } from "~/store";
import WelcomeBanner from "~/components/home/welcome-banner";
import AddDevice from "~/components/home/add-device";
import ShopNowBanner from "~/components/home/shop-now-banner";

export default function Home() {
  const { setRooms } = useRoomsStore();

  useEffect(() => {
    async () => {
      const rooms = await AsyncStorage.getItem("rooms");
      if (!rooms) {
        return;
      }
      setRooms(JSON.parse(rooms));
    };
  }, []);

  return (
    <View className="flex flex-grow flex-col gap-y-4 p-5">
      <WelcomeBanner />
      <ShopNowBanner />
      <AddRoom />
      <AddDevice />
    </View>
  );
}
