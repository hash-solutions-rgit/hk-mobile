import { create } from "zustand";
import { roomSlice } from "./roomSlice";

export const useRoomsStore = create(roomSlice);
