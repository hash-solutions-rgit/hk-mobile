import { StateCreator } from "zustand";
import { Room } from "~/types";

interface RoomSlice {
  rooms: Room[];
  addRoom: (room: Room) => void;
  setRooms: (rooms: Room[]) => void;
}

export const roomSlice: StateCreator<RoomSlice> = (set) => ({
  rooms: [],
  addRoom: (room: Room) => {
    set((state) => ({
      rooms: [...state.rooms, room],
    }));
  },
  setRooms(rooms) {
    set({ rooms });
  },
});
