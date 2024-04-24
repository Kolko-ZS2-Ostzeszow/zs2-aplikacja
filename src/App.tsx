import { StatusBar } from "expo-status-bar";
import { Button, FlatList, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Days, ScheduleData, fetchEdupageData } from "./utils/edupage";
import { useEffect, useState } from "react";
import Lesson from "./components/lesson";
import { Accent1 } from "./theme";
import { Dropdown } from "react-native-element-dropdown";
import DropdownComponent from "./components/dropdown";
import MultiDropdownComponent from "./components/multi_dropdown";
import React from "react";

export default function App() {
  let [schedule, setSchedule] = useState<ScheduleData>();
  let [selectedClass, setSelectedClass] = useState<number>(null);
  let [lessonsData, setLessonsData] = useState<{ hourId: number; name: string }[]>([]);
  let [classGroups, setClassGroups] = useState<{ label: string; value: number }[]>([]);
  let [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  let [refreshing, setRefreshing] = useState<boolean>(false);
  let [dayId, setDayId] = useState<number>(getBestDayId());

  function getBestDayId(): number {
    const date = new Date();
    const day = date.getDay();
    // monday to friday

    if (day >= 1 && day <= 5) {
      return day - 1;
    } else {
      return 1;
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    fetchEdupageData().then((data) => setSchedule(data));
  });

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
    if (schedule != undefined && selectedClass != null) {
      const classId = schedule.classes.find((klasa) => klasa.id == selectedClass).id;
      const groupId = schedule.groups.find((grupa) => grupa.classId == classId && grupa.entireClass).id;
      setLessonsData(
        schedule.lessons
          .filter((lesson) => {
            // return lesson.classIds.includes(classId) && lesson.dayIds.includes(1);
            return (
              lesson.groupIds.some((id) => [...selectedGroups, groupId].includes(id)) && lesson.dayIds.includes(dayId)
            );
          })
          .sort((a, b) => {
            const hourIndexA = a.dayIds.indexOf(dayId);
            const hourIndexB = b.dayIds.indexOf(dayId);

            return a.hourIds[hourIndexA] - b.hourIds[hourIndexB];
          })
          .flatMap((obj) => {
            let data: { hourId: number; name: string }[] = [];
            const hourId = obj.hourIds[obj.dayIds.indexOf(dayId)];
            for (let i = 0; i < obj.duration; i++) {
              data[i] = {
                hourId: hourId + i,
                name: schedule.subjects.find((subject) => subject.id == obj.subjectId).name
              };
            }
            return data;
          })
      );
    }
  }, [selectedClass, selectedGroups, dayId]);

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
          height: "30%",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16
        }}
      >
        <DropdownComponent data={classes} setExternalValue={setSelectedClass}></DropdownComponent>
        <MultiDropdownComponent
          data={classGroups}
          setExternalValue={setSelectedGroups}
          placeholder="Wybierz grupę"
        ></MultiDropdownComponent>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <Button
            title="<-"
            onPress={() => {
              setDayId((dayId - 1 + 5) % 5);
            }}
          />
          <Text style={{ fontSize: 24 }}>{schedule != undefined && Days[dayId].name}</Text>
          <Button
            title="->"
            onPress={() => {
              setDayId((dayId + 1) % 5);
            }}
          />
        </View>
      </View>
      {schedule == undefined && <Text style={{ alignSelf: "center", padding: "20%", fontSize: 36 }}>Ładowanie...</Text>}
      {schedule != undefined && (
        <FlatList
          data={lessonsData}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Text>{schedule.hours[item.hourId].startTime + "-" + schedule.hours[item.hourId].endTime}</Text>
                <Lesson id={item.hourId + 1} lessonName={item.name} />
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}
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
