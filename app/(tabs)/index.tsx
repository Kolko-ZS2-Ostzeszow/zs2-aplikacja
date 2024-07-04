import { StatusBar } from "expo-status-bar";
import { Button, FlatList, LayoutAnimation, Pressable, RefreshControl, Text, View, useColorScheme } from "react-native";
import { Days, fetchEdupageSchedule } from "../utils/edupage";
import { useEffect, useMemo, useState } from "react";
import Lesson from "../components/lesson";
import { Accent1 } from "../theme";
import DropdownComponent from "../components/dropdown";
import MultiDropdownComponent from "../components/multi_dropdown";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Selection } from "../selection";
import { getTextColor } from "../utils/color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Schedule() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [topBarHeight, setTopBarHeight] = useState<number>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dayId, setDayId] = useState<number>(getBestDayId());
  const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

  const scheduleQuery = useQuery({
    queryFn: async () => {
      return await fetchEdupageSchedule();
    },
    queryKey: ["schedule"]
  });

  const selection = useQuery({
    queryFn: async () => {
      let data = await AsyncStorage.getItem("selection");

      if (data == null) return null;

      return JSON.parse(data) as Selection;
    },
    queryKey: ["selection"]
  });

  const classes = useMemo(() => {
    if (scheduleQuery.data == null) return [];

    return scheduleQuery.data.classes.map((classValue) => {
      return { label: classValue.name, value: classValue.id };
    });
  }, [scheduleQuery.data]);
  const [selectedClass, setSelectedClass] = useState<number>(null);

  const classGroups = useMemo(() => {
    if (scheduleQuery.data == null || selectedClass == null) return [];

    return scheduleQuery.data.groups
      .filter((grupa) => grupa.classId === selectedClass && !grupa.entireClass)
      .map((grupa) => {
        return { label: grupa.name, value: grupa.id };
      });
  }, [scheduleQuery.data, selectedClass]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const lessons = useMemo(() => {
    if (scheduleQuery.data == null || selectedClass == null) return [];

    const groupId = scheduleQuery.data.groups.find((grupa) => grupa.classId === selectedClass && grupa.entireClass).id;

    return scheduleQuery.data.lessons
      .filter((lesson) => {
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
            name: scheduleQuery.data.subjects.find((subject) => subject.id === obj.subjectId).name,
            classroom: scheduleQuery.data.classrooms.find((classroom) => classroom.id === obj.classroomId).short,
            teacher: scheduleQuery.data.teachers.find((teacher) => teacher.id === obj.teacherId).short
          };
        }
        return data;
      });
  }, [scheduleQuery.data, selectedClass, selectedGroups, dayId]);

  useEffect(() => {
    if (scheduleQuery.data == null || selection.data == null) return;

    setSelectedClass(classes.find((value) => value.label === selection.data.className).value);
  }, [scheduleQuery.data, selection.data, classes]);

  useEffect(() => {
    if (scheduleQuery.data == null || selection.data == null || selectedClass == null || classGroups.length === 0)
      return;

    setSelectedGroups(
      classGroups.filter((value) => selection.data.classGroups.includes(value.label)).map((value) => value.value)
    );
  }, [scheduleQuery.data, selection.data, selectedClass, classGroups]);

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

  function setClass(value: number) {
    setSelectedClass(value);
    let newSelection = {
      className: classes.find((klasa) => klasa.value === value).label,
      classGroups: []
    };
    AsyncStorage.setItem("selection", JSON.stringify(newSelection));
  }

  function setGroups(value: number[]) {
    setSelectedGroups(value);
    let newSelection = {
      className: selection.data.className,
      classGroups: classGroups.filter((group) => value.includes(group.value)).map((group) => group.label)
    };
    AsyncStorage.setItem("selection", JSON.stringify(newSelection));
  }

  return (
    <View style={{ flex: 1, paddingTop: topBarHeight }}>
      <View
        onLayout={(event) => {
          if (!filterExpanded) {
            setTopBarHeight(event.nativeEvent.layout.height);
          }
        }}
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 24,
          backgroundColor: Accent1,
          height: "auto",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          position: "absolute",
          width: "100%",
          zIndex: 1
        }}
      >
        {filterExpanded && (
          <View>
            <DropdownComponent
              data={classes}
              externalValue={selectedClass}
              setExternalValue={setClass}
            ></DropdownComponent>
            <MultiDropdownComponent
              data={classGroups}
              setExternalValue={setGroups}
              externalValue={selectedGroups}
              placeholder="Wybierz grupę"
            ></MultiDropdownComponent>
          </View>
        )}
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 2,
              paddingHorizontal: 8
            }}
          >
            <Button
              title="<-"
              onPress={() => {
                setDayId((dayId - 1 + 5) % 5);
              }}
            />
            <Text style={{ fontSize: 24, color: "white" }}>{scheduleQuery.data != undefined && Days[dayId].name}</Text>
            <Button
              title="->"
              onPress={() => {
                setDayId((dayId + 1) % 5);
              }}
            />
          </View>
          <Pressable
            style={{ padding: 8, justifyContent: "center" }}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFilterExpanded(!filterExpanded);
            }}
          >
            <MaterialCommunityIcons name="filter" size={32} color="white" />
          </Pressable>
        </View>
      </View>
      {scheduleQuery.isLoading && (
        <Text style={{ alignSelf: "center", padding: "20%", fontSize: 36, color: getTextColor(scheme) }}>
          Ładowanie...
        </Text>
      )}
      {scheduleQuery.data != undefined && (
        <FlatList
          data={lessons}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Text style={{ color: scheme === "light" ? "black" : "white" }}>
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
