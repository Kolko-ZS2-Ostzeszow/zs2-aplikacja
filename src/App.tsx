import { StatusBar } from "expo-status-bar";
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ScheduleData, fetchEdupageData } from "./utils/edupage";
import { useEffect, useState } from "react";
import Lesson from "./components/lesson";
import { Accent1 } from "./theme";
import { Dropdown } from "react-native-element-dropdown";
import DropdownComponent from "./components/dropdown";
import MultiDropdownComponent from "./components/multi_dropdown";

export default function App() {
  let [schedule, setSchedule] = useState<ScheduleData>();
  let [selectedClass, setSelectedClass] = useState<number>(null);
  let [lessonNames, setLessonNames] = useState<string[]>([]);
  let [classGroups, setClassGroups] = useState<{ label: string; value: number }[]>([]);
  let [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  useEffect(() => {
    fetchEdupageData().then((data) => setSchedule(data));
  }, []);

  useEffect(() => {
    if (schedule == undefined) return;

    setClassGroups(
      schedule.groups
        .filter((grupa) => grupa.classId == selectedClass && !grupa.entireClass)
        .map((grupa) => {
          return { label: grupa.name, value: grupa.id };
        })
    );
  }, [selectedClass]);

  useEffect(() => {
    if (schedule != undefined) {
      const classId = schedule.classes.find((klasa) => klasa.id == selectedClass).id;
      const groupId = schedule.groups.find((grupa) => grupa.classId == classId && grupa.entireClass).id;
      setLessonNames(
        schedule.lessons
          .filter((lesson) => {
            // return lesson.classIds.includes(classId) && lesson.dayIds.includes(1);
            return lesson.groupIds.some((id) => [...selectedGroups, groupId].includes(id)) && lesson.dayIds.includes(1);
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
          })
      );
    }
  }, [selectedClass, selectedGroups]);

  // przykład wyciągania danych
  //schedule.lessons.filter((lesson) => lesson.classIds == schedule.classes.find((klasa) => klasa.name == "4TP").id);
  let classes: { label: string; value: number }[] = [];
  if (schedule != undefined) {
    //   const classId = schedule.classes.find((klasa) => klasa.name == "2PS").id;
    //   const groupId = schedule.groups.filter((grupa) => grupa.classId == classId);
    //   const zgrupa = groupId.find((grupa) => grupa.id == 261); // grupa zawodowa
    //   const jgrupa = groupId.find((grupa) => grupa.id == 253); // grupa językowa
    //   // cała klasa lesson.groupIds.includes(groupId[0].id)
    //   // console.log(groupId); // aby wyświetlić wszystkie grupy, zmień klase u góry aby pokazać jej grupy
    //   lessonNames = schedule.lessons
    //     .filter((lesson) => {
    //       // return lesson.classIds.includes(classId) && lesson.dayIds.includes(1);
    //       return (
    //         (lesson.groupIds.includes(zgrupa.id) ||
    //           lesson.groupIds.includes(groupId[0].id) ||
    //           lesson.groupIds.includes(jgrupa.id)) &&
    //         lesson.dayIds.includes(1)
    //       );
    //     })
    //     .sort((a, b) => {
    //       const hourIndexA = a.dayIds.indexOf(1);
    //       const hourIndexB = b.dayIds.indexOf(1);

    //       return a.hourIds[hourIndexA] - b.hourIds[hourIndexB];
    //     })
    //     .flatMap((data) => {
    //       let names = [];
    //       for (let i = 0; i < data.duration; i++) {
    //         names[i] = schedule.subjects.find((subject) => subject.id == data.subjectId).name;
    //       }
    //       return names;
    //     });

    classes = schedule.classes.map((klasa) => {
      return { label: klasa.name, value: klasa.id };
    });

    if (classes.length > 0 && selectedClass == null) {
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          paddingTop: Platform.OS === "android" ? 25 : 0,
          backgroundColor: Accent1,
          height: "20%",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16
        }}
      >
        <DropdownComponent data={classes} setExternalValue={setSelectedClass}></DropdownComponent>
        <MultiDropdownComponent data={classGroups} setExternalValue={setSelectedGroups} placeholder="Wybierz grupę"></MultiDropdownComponent>
      </View>
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
