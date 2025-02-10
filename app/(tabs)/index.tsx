import { FlatList, Pressable, RefreshControl, Text, View, useColorScheme } from "react-native";
import { Days, fetchEdupageSchedule, ScheduleData } from "../../src/misc/edupage";
import { useState } from "react";
import Lesson from "../../src/components/lesson";
import { Accent1, Accent2 } from "../../src/theme";
import DropdownComponent from "../../src/components/dropdown";
import MultiDropdownComponent from "../../src/components/multi_dropdown";
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Selection } from "../../src/selection";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue, withTiming } from "react-native-reanimated";
import { getBestDayId } from "../../src/misc/get_best_day";
import { useSchedule } from "../../src/misc/use_schedule";
import { getTextColor } from "../../src/misc/color";

export default function Schedule() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [topBarHeight, setTopBarHeight] = useState<number>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dayId, setDayId] = useState<number>(getBestDayId());
  const [filterExpanded, setFilterExpanded] = useState<boolean>(false);

  const cachedScheduleQuery = useQuery({
    queryFn: async () => {
      const cachedDataJson = await AsyncStorage.getItem("data-cache");

      if (cachedDataJson == null) return null;

      return JSON.parse(cachedDataJson) as ScheduleData;
    },
    queryKey: ["schedule-cache"]
  });

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

  const [selectedClass, setSelectedClass] = useState<number>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const currentData = scheduleQuery.data == undefined ? cachedScheduleQuery.data : scheduleQuery.data;

  const [classes, lessons, classGroups] = useSchedule(
    currentData,
    selection.data,
    dayId,
    selectedClass,
    selectedGroups,
    setClass,
    setSelectedClass,
    setSelectedGroups
  );

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
    queryClient.setQueryData(["selection"], newSelection);
  }

  function setGroups(value: number[]) {
    setSelectedGroups(value);
    let newSelection = {
      className: selection.data.className,
      classGroups: classGroups.filter((group) => value.includes(group.value)).map((group) => group.label)
    };
    AsyncStorage.setItem("selection", JSON.stringify(newSelection));
    queryClient.setQueryData(["selection"], newSelection);
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
        <Animated.View
          layout={LinearTransition}
          style={{ flexDirection: "row", gap: 18, paddingHorizontal: 8, marginBottom: 8 }}
        >
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
        {(scheduleQuery.isLoading || scheduleQuery.isError) && (
          <Animated.View
            style={{
              backgroundColor: Accent2,
              marginTop: -4,
              borderBottomRightRadius: 16,
              borderBottomLeftRadius: 16,
              bottom: 0,
              padding: 2
            }}
          >
            <Text style={{ color: "white", textAlign: "center" }}>
              {scheduleQuery.isLoading ? "Ładowanie z internetu..." : "Wystąpił błąd"}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
      {currentData != undefined && ( selectedClass != null ? (
        <FlatList
          data={lessons}
          renderItem={({ item, index }) => {
            return (
              <View style={{ marginTop: 12, marginBottom: 10 }}>
                <Text style={{ color: scheme === "light" ? "black" : "white", marginLeft: 2, marginBottom: 2 }}>
                  {currentData.hours[item.hourId].startTime + "-" + currentData.hours[item.hourId].endTime}
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
      ) : (
        <Text style={{color: getTextColor(scheme), fontSize: 24, marginHorizontal: "auto", marginVertical: 48, width: "70%", textAlign: "center"}}>
          Rozwiń górny pasek i wybierz klasę
        </Text>)
      )}
    </View>
  );
}
