import { Dimensions, Text, View } from "react-native";
import { Accent1 } from "../theme";

interface LessonProps {
  id: number;
  lessonName: string;
}

export default function Lesson(props: LessonProps) {
  let lessonName = props.lessonName;
  const maxNameLength = 34;
  if (lessonName.length > maxNameLength) {
    lessonName = lessonName.slice(0, maxNameLength).trimEnd() + "...";
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
      <Text style={{ color: "white", fontSize: 20, flexShrink: 1 }}>{lessonName}</Text>
    </View>
  );
}
