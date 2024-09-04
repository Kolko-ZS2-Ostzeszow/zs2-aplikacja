import { useQuery } from "@tanstack/react-query";
import { fetchSubstitutionData } from "../utils/edupage";
import { FlatList, Pressable, Text, View, useColorScheme } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Accent1, DarkFg } from "../theme";
import { getBackgroundColor, getTextColor } from "../utils/color";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { throttle } from "../utils/throttle";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

export default function Substitutions() {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const [topBarHeight, setTopBarHeight] = useState<number>();
  const [date, setDate] = useState<Date>(new Date());

  const substitutionsQuery = useQuery({
    queryFn: async () => {
      let data = await fetchSubstitutionData(date, "classes");
      return data;
    },
    queryKey: ["substitutions", date]
  });

  const datePickerPressed = throttle(() => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (event, selectedDate) => {
        setDate(selectedDate);
        substitutionsQuery.refetch();
      },
      mode: "date"
    });
  }, 100);

  return (
    <View style={{ backgroundColor: getBackgroundColor(scheme), paddingTop: topBarHeight }}>
      <View
        onLayout={(event) => {
          setTopBarHeight(event.nativeEvent.layout.height);
        }}
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 16,
          backgroundColor: Accent1,
          height: "auto",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          position: "absolute",
          width: "100%",
          zIndex: 1
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Pressable
            style={{ padding: 4, borderRadius: 8 }}
            android_ripple={{ radius: 96 }}
            onPressIn={() => {
              datePickerPressed();
            }}
          >
            <Text style={{ fontSize: 28, color: "white" }}>
              {Intl.DateTimeFormat("pl-pl", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              }).format(date) + "r."}
            </Text>
          </Pressable>
        </View>
      </View>
      {substitutionsQuery.isLoading && (
        <Text style={{ color: getTextColor(scheme), textAlign: "center", paddingVertical: "50%", fontSize: 36 }}>
          Ładowanie...
        </Text>
      )}
      {substitutionsQuery.isError && (
        <View>
          <Text style={{ color: getTextColor(scheme) }}>{substitutionsQuery.error.message}</Text>
        </View>
      )}
      {substitutionsQuery.data?.length === 0 && (
        <Text style={{ color: getTextColor(scheme), textAlign: "center", paddingVertical: "50%", fontSize: 36 }}>
          Brak zastępstw
        </Text>
      )}
      <FlatList
        data={substitutionsQuery.data}
        contentContainerStyle={{ gap: 16, paddingTop: 8 }}
        renderItem={(data) => {
          return (
            <View>
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: 24,
                  marginBottom: 8,
                  color: getTextColor(scheme)
                }}
              >
                {data.item.className}
              </Text>
              {data.item.isAbsent && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: scheme === "light" ? "lightgray" : DarkFg,
                    borderRadius: 8,
                    marginHorizontal: 8,
                    padding: 8
                  }}
                >
                  <MaterialIcons name="do-not-disturb" size={24} color="red" />
                  <Text style={{ color: getTextColor(scheme) }}>Nieobecność</Text>
                </View>
              )}
              {!data.item.isAbsent &&
                data.item.rows.map((row) => (
                  <View
                    key={JSON.stringify(row)}
                    style={{
                      marginBottom: 8,
                      backgroundColor: Accent1,
                      padding: 8,
                      marginHorizontal: 8,
                      borderRadius: 8
                    }}
                  >
                    <View style={{ flexDirection: "row", gap: 16, justifyContent: "space-between" }}>
                      <Text style={{ color: "white", fontWeight: "600" }}>{row.period}</Text>
                      <Text style={{ color: "white", fontWeight: "600" }}>{row.groups.join(", ")}</Text>
                    </View>
                    <View>
                      {row.type === "cancel" && (
                        <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                          <Text style={{ color: "white" }}>{row.diff.subject.original}</Text>
                          <AntDesign name="arrowright" size={24} color="white" />
                          <Text style={{ color: "white", textAlign: "right" }}>Anulowano</Text>
                        </View>
                      )}
                      {row.type === "change" && (
                        <View>
                          {row.diff.subject && (
                            <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                              <Text style={{ color: "white" }}>{row.diff.subject.original}</Text>
                              {row.diff.subject.replacement && <AntDesign name="arrowright" size={24} color="white" />}
                              {row.diff.subject.replacement && (
                                <Text style={{ color: "white" }}>{row.diff.subject.replacement}</Text>
                              )}
                            </View>
                          )}
                          {row.diff.teacher && row.diff.teacher.replacement && (
                            <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                              <Text style={{ color: "white" }}>{row.diff.teacher.original}</Text>
                              {row.diff.teacher.replacement && <AntDesign name="arrowright" size={24} color="white" />}
                              {row.diff.teacher.replacement && (
                                <Text style={{ color: "white" }}>{row.diff.teacher.replacement}</Text>
                              )}
                            </View>
                          )}
                          {row.diff.classroom && row.diff.classroom.replacement && (
                            <View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
                              <Text style={{ color: "white" }}>{row.diff.classroom.original}</Text>
                              {row.diff.classroom.replacement && (
                                <AntDesign name="arrowright" size={24} color="white" />
                              )}
                              {row.diff.classroom.replacement && (
                                <Text style={{ color: "white" }}>{row.diff.classroom.replacement}</Text>
                              )}
                            </View>
                          )}
                        </View>
                      )}
                      {row.info !== "" && <Text style={{ color: "white" }}>Informacja: {row.info}</Text>}
                    </View>
                  </View>
                ))}
            </View>
          );
        }}
      ></FlatList>
    </View>
  );
}
