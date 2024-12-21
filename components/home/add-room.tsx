import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Text } from "../ui/text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoomsStore } from "~/store";
import { Room } from "~/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { View } from "react-native";
import { Input } from "../ui/input";

type Props = {};

function AddRoom({}: Props) {
  // local state
  const [roomName, setRoomName] = useState("");
  const [open, setOpen] = useState(false);

  // hooks
  const { addRoom, rooms } = useRoomsStore();

  // handlers
  const handleAddRoom = async () => {
    const room: Room = {
      id: Math.random().toString(),
      name: roomName,
    };
    addRoom(room);
    await AsyncStorage.setItem("rooms", JSON.stringify(rooms));
    setRoomName("");
    setOpen(false);
  };

  const handleRoomNameChange = (text: string) => {
    setRoomName(text);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Text>Add Room</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Add Room</DialogTitle>
          <DialogDescription>
            <Text className="text-sm text-muted-foreground">
              Add a new room to your home
            </Text>
          </DialogDescription>
        </DialogHeader>
        <View>
          <Input
            placeholder="Room Name"
            value={roomName}
            onChangeText={handleRoomNameChange}
          />
          <Button
            className="mt-4"
            disabled={!roomName || roomName.length < 3}
            onPress={handleAddRoom}
          >
            <Text>Add Room</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
}

export default AddRoom;
