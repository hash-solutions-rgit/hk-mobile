import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { FlatList, ScrollView, View } from "react-native";
import Render from "~/components/common/render";
import AddRoom from "~/components/home/add-room";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useRoomsStore } from "~/store";
import { CirclePlus } from "~/lib/icons/circle-plus";
import { Room } from "~/types";

export default function Home() {
  const { setRooms, rooms } = useRoomsStore();

  const RoomCard = ({ item }: { item: Room }) => {
    return (
      <View className="bg-gray-100 p-5 rounded-lg border border-gray-200 w-1/2 m-2">
        <Text className="text-xl font-semibold">{item.name}</Text>
      </View>
    );
  };

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
    <View className="flex-grow p-5 flex flex-col gap-y-4">
      <View className="flex flex-col gap-y-0.5">
        <Text className="text-5xl font-semibold">Welcome 👋</Text>
        <Text className="">Welcome to home</Text>
      </View>

      <View className="bg-gray-100 p-5 rounded-lg border border-gray-200"></View>

      <View className="flex flex-col gap-y-4 flex-1">
        <View className="flex flex-row justify-between">
          <Text className="text-xl font-semibold">Your Rooms</Text>
          <AddRoom />
        </View>

        <Render renderIf={!!rooms.length}>
          <FlatList
            data={rooms}
            numColumns={2}
            renderItem={RoomCard}
            keyExtractor={(room: Room) => room.id}
            className="gap-4"
          />
        </Render>

        <Render renderIf={!rooms.length}>
          <View className="border-2 border-dashed p-5 flex flex-col gap-y-2 justify-center items-center rounded-lg">
            <Text className="text-center text-lg text-primary font-medium">
              No Rooms Added Yet, Add Room to get started
            </Text>
            <AddRoom />
          </View>
        </Render>
      </View>

      <View className="p-2">
        <Button className="bg-primary text-white rounded-full p-2 gap-2 flex flex-row">
          <CirclePlus className="w-6 h-6 text-white" />
          <Text>Add Device</Text>
        </Button>
      </View>
    </View>
  );
}
