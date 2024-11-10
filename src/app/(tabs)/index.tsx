import { FlatList, Pressable, RefreshControl, ScrollView, Text, View, useColorScheme } from "react-native";
import { Days, fetchEdupageSchedule } from "../../utils/edupage";
import { useEffect, useMemo, useState } from "react";
import Lesson from "../../components/lesson";
import { Accent1 } from "../../theme";
import DropdownComponent from "../../components/dropdown";
import MultiDropdownComponent from "../../components/multi_dropdown";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Selection } from "../../selection";
import { getTextColor } from "../../utils/color";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue, withTiming } from "react-native-reanimated";

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
        let data: { hourId: number; name: string; classroom: string | null; teacher: string; group: string | null }[] =
          [];
        const hourId = obj.hourId;
        for (let i = 0; i < obj.duration; i++) {
          data[i] = {
            hourId: hourId + i,
            name: scheduleQuery.data.subjects.find((subject) => subject.id === obj.subjectId).name,
            classroom: scheduleQuery.data.classrooms.find((classroom) => classroom.id === obj.classroomId).short,
            teacher: scheduleQuery.data.teachers.find((teacher) => teacher.id === obj.teacherId).short,
            group: scheduleQuery.data.groups.find((group) => obj.groupIds.includes(group.id) && !group.entireClass)
              ?.name
          };
        }
        return data;
      });
  }, [scheduleQuery.data, selectedClass, selectedGroups, dayId]);

  useEffect(() => {
    if (scheduleQuery.data == null || selection.data == null) return;

    let foundClass = classes.find((value) => value.label === selection.data.className);
    if (foundClass === undefined) {
      setClass(null);
      return;
    }

    setSelectedClass(foundClass.value);
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
      className: value ? classes.find((klasa) => klasa.value === value).label : null,
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

  const animationDistance = 150;
  const animationDuration = 300;

  const flipAnimDir = useSharedValue(false);
  const haventInteractedWithDay = useSharedValue(true);

  const entering = (values) => {
    "worklet";
    const animations = haventInteractedWithDay.value
      ? {}
      : {
          originX: withTiming(values.targetOriginX, {
            duration: animationDuration
          }),
          opacity: withTiming(1, {
            duration: animationDuration
          })
        };
    const initialValues = haventInteractedWithDay.value
      ? { originX: values.targetOriginX, opacity: 1 }
      : {
          originX: values.targetOriginX - animationDistance * (flipAnimDir.value ? 1 : -1),
          opacity: 0
        };
    return {
      initialValues,
      animations
    };
  };

  const exiting = (values) => {
    "worklet";
    const animations = {
      originX: withTiming(values.currentOriginX + animationDistance * (flipAnimDir.value ? 1 : -1), {
        duration: animationDuration
      }),
      opacity: withTiming(0, {
        duration: animationDuration
      })
    };
    const initialValues = {
      originX: values.currentOriginX,
      opacity: 1
    };
    return {
      initialValues,
      animations
    };
  };

  return (
    <View style={{ flex: 1, paddingTop: topBarHeight }}>
      <Animated.View
        onLayout={(event) => {
          if (!filterExpanded) {
            setTopBarHeight(event.nativeEvent.layout.height);
          }
        }}
        layout={LinearTransition}
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 14,
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
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <DropdownComponent
              data={classes}
              externalValue={selectedClass}
              setExternalValue={setClass}
              placeholder="Wybierz klasę"
              searchPlaceholder="Szukaj..."
              placeholderStyle={{
                color: "gray"
              }}
            ></DropdownComponent>
            <MultiDropdownComponent
              data={classGroups}
              setExternalValue={setGroups}
              externalValue={selectedGroups}
              placeholder="Wybierz grupę"
              searchPlaceholder="Szukaj..."
              placeholderStyle={{
                color: "gray"
              }}
            ></MultiDropdownComponent>
          </Animated.View>
        )}
        <Animated.View layout={LinearTransition} style={{ flexDirection: "row", gap: 18, paddingHorizontal: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 2,
              paddingHorizontal: 8
            }}
          >
            <Pressable
              onPress={() => {
                flipAnimDir.value = true;
                haventInteractedWithDay.value = false;
                setDayId((dayId - 1 + 5) % 5);
              }}
              android_ripple={{ radius: 22, color: "#ffffff77", borderless: true }}
            >
              <FontAwesome size={32} name="long-arrow-left" color={"white"}></FontAwesome>
            </Pressable>
            <View style={{ overflow: "hidden", flex: 1, marginHorizontal: 4 }}>
              <Animated.Text
                key={Days[dayId].name}
                entering={entering}
                exiting={exiting}
                style={{ fontSize: 28, color: "white", textAlign: "center" }}
              >
                {Days[dayId].name}
              </Animated.Text>
            </View>
            <Pressable
              onPress={() => {
                flipAnimDir.value = false;
                haventInteractedWithDay.value = false;
                setDayId((dayId + 1) % 5);
              }}
              android_ripple={{ radius: 22, color: "#ffffff77", borderless: true }}
            >
              <FontAwesome size={32} name="long-arrow-right" color={"white"}></FontAwesome>
            </Pressable>
          </View>
          <Pressable
            style={{ padding: 8, justifyContent: "center" }}
            android_ripple={{ radius: 22, color: "#ffffff77" }}
            onPress={() => {
              setFilterExpanded(!filterExpanded);
            }}
          >
            <MaterialCommunityIcons name="filter" size={32} color="white" />
          </Pressable>
        </Animated.View>
      </Animated.View>
      {scheduleQuery.isLoading && (
        <Text style={{ alignSelf: "center", padding: "20%", fontSize: 36, color: getTextColor(scheme) }}>
          Ładowanie...
        </Text>
      )}
      {scheduleQuery.error != undefined && (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}>
          <View style={{ alignSelf: "center", marginVertical: "50%" }}>
            <Text style={{ alignSelf: "center", fontSize: 24, color: getTextColor(scheme) }}>
              Nie udało się pobrać planu lekcji
            </Text>
            <Text
              style={{
                alignSelf: "center",
                fontSize: 16,
                color: getTextColor(scheme),
                fontStyle: "italic",
                fontFamily: "monospace"
              }}
            >
              {"[" + scheduleQuery.error.message + "]"}
            </Text>
          </View>
        </ScrollView>
      )}
      {scheduleQuery.data != undefined && (
        <FlatList
          data={lessons}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 10 }}>
                <Text style={{ color: scheme === "light" ? "black" : "white", marginLeft: 2, marginBottom: 2 }}>
                  {scheduleQuery.data.hours[item.hourId].startTime +
                    "-" +
                    scheduleQuery.data.hours[item.hourId].endTime}
                </Text>
                <Lesson
                  id={item.hourId + 1}
                  name={item.name}
                  classroom={item.classroom}
                  teacher={item.teacher}
                  group={item.group}
                />
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}></RefreshControl>}
        />
      )}
    </View>
  );
}
