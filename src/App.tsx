import { StatusBar } from "expo-status-bar";
import { Button, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Days, fetchEdupageData } from "./utils/edupage";
import { useEffect, useState } from "react";
import Lesson from "./components/lesson";
import { Accent1 } from "./theme";
import DropdownComponent from "./components/dropdown";
import MultiDropdownComponent from "./components/multi_dropdown";
import React from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

var queryClient = new QueryClient();

export default function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <App></App>
    </QueryClientProvider>
  );
}

function App() {
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
  let [classes, setClasses] = useState<{ label: string; value: number }[]>([]);
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
    scheduleQuery.refetch().then(() => {
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    if (scheduleQuery.isLoading) return;
  }, [scheduleQuery]);

  useEffect(() => {
    if (scheduleQuery.isLoading) return;

    setClassGroups(
      scheduleQuery.data.groups
        .filter((grupa) => grupa.classId == selectedClass && !grupa.entireClass)
        .map((grupa) => {
          return { label: grupa.name, value: grupa.id };
        })
    );
  }, [selectedClass]);

  useEffect(() => {
    if (!scheduleQuery.isLoading && selectedClass != null) {
      const classId = scheduleQuery.data.classes.find((klasa) => klasa.id == selectedClass).id;
      const groupId = scheduleQuery.data.groups.find((grupa) => grupa.classId == classId && grupa.entireClass).id;
      setLessonsData(
        scheduleQuery.data.lessons
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
                name: scheduleQuery.data.subjects.find((subject) => subject.id == obj.subjectId).name
              };
            }
            return data;
          })
      );
    }
  }, [selectedClass, selectedGroups, dayId]);

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
