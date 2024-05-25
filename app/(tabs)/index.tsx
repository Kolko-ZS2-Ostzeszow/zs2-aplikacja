import { StatusBar } from "expo-status-bar";
import { Button, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Days, fetchEdupageData } from "../utils/edupage";
import { useEffect, useState } from "react";
import Lesson from "../components/lesson";
import { Accent1 } from "../theme";
import DropdownComponent from "../components/dropdown";
import MultiDropdownComponent from "../components/multi_dropdown";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Selection } from "../selection";

export default function Page() {
  const scheduleQuery = useQuery({
    queryFn: async () => {
      let data = await fetchEdupageData();
      setClasses(
        data.classes.map((klasa) => {
          return { label: klasa.name, value: klasa.id };
        })
      );
      return data;
    },
    queryKey: ["schedule"]
  });

  const selection = useQuery({
    queryFn: async () => {
      let data = await AsyncStorage.getItem("selection");

      if (data == null) {
        return { className: null, classGroups: [] } as Selection;
      }

      return JSON.parse(data) as Selection;
    },
    queryKey: ["selection"]
  });

  let [classes, setClasses] = useState<{ label: string; value: number }[]>([]);
  let [selectedClass, setSelectedClass] = useState<number>(null);
  let [lessonsData, setLessonsData] = useState<
    { hourId: number; name: string; classroom: string | null; teacher: string }[]
  >([]);
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
      return 0;
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    scheduleQuery.refetch().then(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    if (scheduleQuery.isLoading) return;

    setClassGroups(
      scheduleQuery.data.groups
        .filter((grupa) => grupa.classId == selectedClass && !grupa.entireClass)
        .map((grupa) => {
          return { label: grupa.name, value: grupa.id };
        })
    );

    setSelectedGroups([]);
  }, [selectedClass]);

  useEffect(() => {
    if (!scheduleQuery.isLoading && selectedClass != null) {
      const classId = scheduleQuery.data.classes.find((klasa) => klasa.id == selectedClass).id;

      const groupId = scheduleQuery.data.groups.find((grupa) => grupa.classId == classId && grupa.entireClass).id;
      setLessonsData(
        scheduleQuery.data.lessons
          .filter((lesson) => {
            // return lesson.classIds.includes(classId) && lesson.dayIds.includes(1);
            return lesson.groupIds.some((id) => [...selectedGroups, groupId].includes(id)) && lesson.dayId === dayId;
          })
          .sort((a, b) => {
            return a.hourId - b.hourId;
          })
          .flatMap((obj) => {
            let data: { hourId: number; name: string; classroom: string | null; teacher: string }[] = [];
            const hourId = obj.hourId;
            for (let i = 0; i < obj.duration; i++) {
              data[i] = {
                hourId: hourId + i,
                name: scheduleQuery.data.subjects.find((subject) => subject.id == obj.subjectId).name,
                classroom: scheduleQuery.data.classrooms.find((classroom) => classroom.id == obj.classroomId).short,
                teacher: scheduleQuery.data.teachers.find((teacher) => teacher.id == obj.teacherId).short
              };
            }
            return data;
          })
      );
    }
  }, [selectedClass, selectedGroups, dayId]);

  useEffect(() => {
    if (selection.isLoading) return;
    if (classes == null) return;

    if (selection.data.className != null) {
      setSelectedClass(classes.find((klasa) => klasa.label == selection.data.className).value);
    }

    if (classGroups == null || classGroups.length == 0) return;

    if (selection.data.classGroups.length > 0) {
      setSelectedGroups(
        selection.data.classGroups.map((group) => classGroups.find((grupa) => grupa.label == group).value)
      );
    }
  }, [classes, classGroups]);

  function setClass(value: number) {
    setSelectedClass(value);
    selection.data.className = classes.find((klasa) => klasa.value == value).label;
    selection.data.classGroups = [];
    AsyncStorage.setItem("selection", JSON.stringify(selection.data));
  }

  function setGroup(value: number[]) {
    setSelectedGroups(value);
    selection.data.classGroups = value.map((group) => classGroups.find((grupa) => grupa.value == group).label);
    AsyncStorage.setItem("selection", JSON.stringify(selection.data));
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
        <DropdownComponent data={classes} externalValue={selectedClass} setExternalValue={setClass}></DropdownComponent>
        <MultiDropdownComponent
          data={classGroups}
          setExternalValue={setGroup}
          externalValue={selectedGroups}
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
          <Text style={{ fontSize: 24 }}>{scheduleQuery.data != undefined && Days[dayId].name}</Text>
          <Button
            title="->"
            onPress={() => {
              setDayId((dayId + 1) % 5);
            }}
          />
        </View>
      </View>
      {scheduleQuery.isLoading && (
        <Text style={{ alignSelf: "center", padding: "20%", fontSize: 36 }}>Ładowanie...</Text>
      )}
      {scheduleQuery.data != undefined && (
        <FlatList
          data={lessonsData}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Text>
                  {scheduleQuery.data.hours[item.hourId].startTime +
                    "-" +
                    scheduleQuery.data.hours[item.hourId].endTime}
                </Text>
                <Lesson id={item.hourId + 1} name={item.name} classroom={item.classroom} teacher={item.teacher} />
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
