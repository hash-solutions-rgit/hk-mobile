import React from "react";
import { FlatList, View } from "react-native";
import Render from "~/components/common/render";
import { Text } from "~/components/ui/text";
import AddRoomForm from "./add-room-form";
import RoomCard from "./room-card";
import { Room } from "~/types";
import { useRoomsStore } from "~/store";

type Props = {};

function AddRoom({}: Props) {
  // hooks
  const { rooms } = useRoomsStore();

  return (
    <View className="flex flex-col gap-y-4 flex-1">
      <View className="flex flex-row justify-between">
        <Text className="text-xl font-semibold">Your Rooms</Text>

        <Render renderIf={!!rooms.length}>
          <AddRoomForm />
        </Render>
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
          <AddRoomForm />
        </View>
      </Render>
    </View>
  );
}

export default AddRoom;
