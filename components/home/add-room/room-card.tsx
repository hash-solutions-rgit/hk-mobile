import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { Room } from "~/types";

type Props = {
  item: Room;
};

const RoomCard = ({ item }: Props) => {
  return (
    <View className="bg-gray-100 p-5 rounded-lg border border-gray-200 w-1/2 m-2">
      <Text className="text-xl font-semibold">{item.name}</Text>
    </View>
  );
};

export default RoomCard;
