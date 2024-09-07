import { Text, View } from "react-native";
import { Accent1 } from "../theme";

interface LessonProps {
  id: number;
  name: string;
  classroom: string | null;
  teacher: string;
  group: string | null;
}

export default function Lesson(props: LessonProps) {
  let name = props.name;
  const maxNameLength = 34;
  if (name.length > maxNameLength) {
    name = name.slice(0, maxNameLength).trimEnd() + "...";
  }

  return (
    <View
      style={{
        backgroundColor: Accent1,
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 8,
        borderRadius: 12,
        marginHorizontal: 8
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold", fontSize: 36, padding: 4 }}>{props.id}</Text>
      <Text style={{ color: "white", fontSize: 18, flexShrink: 1 }}>{name}</Text>
      <Text style={{ color: "white", fontSize: 14, position: "absolute", right: 12, top: 6, textAlign: "right" }}>
        {props.group ? `${props.group} • ${props.classroom}` : props.classroom}
      </Text>
      <Text style={{ color: "white", fontSize: 14, position: "absolute", right: 12, bottom: 6, textAlign: "right" }}>
        {props.teacher}
      </Text>
    </View>
  );
}
