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
      .filter((lesson) => lesson.classIds == classId && lesson.dayIds == 1)
      .sort((a, b) => {
        return a.hourIds - b.hourIds;
      })
      .flatMap((data) => {
        let names = [];
        for (let i = 0; i < data.duration; i++) {
          names[i] = schedule.subjects.filter((subject) => subject.id == data.subjectId)[0].name;
        }
        return names;
      });
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <View style={{ marginTop: 24 }}>
                <Lesson id={index + 1} lessonName={item} />
              </View>
            );
          }}
        />
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  }
});
