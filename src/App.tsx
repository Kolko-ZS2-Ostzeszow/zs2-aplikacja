import { StatusBar } from "expo-status-bar";
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ScheduleData, fetchEdupageData } from "./utils/edupage";
import { useEffect, useState } from "react";
import Lesson from "./components/lesson";
import { Accent1 } from "./theme";

export default function App() {
  let [schedule, setSchedule] = useState<ScheduleData>();

  useEffect(() => {
    fetchEdupageData().then((data) => setSchedule(data));
  }, []);

  // przykład wyciągania danych
  //schedule.lessons.filter((lesson) => lesson.classIds == schedule.classes.find((klasa) => klasa.name == "4TP").id);
  let lessonNames: string[] = [];
  if (schedule != undefined) {
    const classId = schedule.classes.find((klasa) => klasa.name == "4TP").id;
    lessonNames = schedule.lessons
      .filter((lesson) => {
        return lesson.classIds.includes(classId) && lesson.dayIds.includes(1);
      })
      .sort((a, b) => {
        const hourIndexA = a.dayIds.indexOf(1);
        const hourIndexB = b.dayIds.indexOf(1);

        return a.hourIds[hourIndexA] - b.hourIds[hourIndexB];
      })
      .flatMap((data) => {
        let names = [];
        for (let i = 0; i < data.duration; i++) {
          names[i] = schedule.subjects.find((subject) => subject.id == data.subjectId).name;
        }
        return names;
      });
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: Platform.OS === "android" ? 25 : 0,
          backgroundColor: Accent1,
          height: "10%",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16
        }}
      ></View>
      {schedule == undefined && <Text style={{ alignSelf: "center", padding: "20%", fontSize: 36 }}>Ładowanie...</Text>}
      {schedule != undefined && (
        <FlatList
          data={lessonNames}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Text>{schedule.hours[index].startTime + "-" + schedule.hours[index].endTime}</Text>
                <Lesson id={index + 1} lessonName={item} />
              </View>
            );
          }}
        />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
