import { useQuery } from "@tanstack/react-query";
import { fetchSubstitutionData } from "../utils/edupage";
import { FlatList, Text, View, useColorScheme } from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { Accent1 } from "../theme";
import { getBackgroundColor, getTextColor } from "../utils/color";

export default function Substitutions() {
  const substitutionsQuery = useQuery({
    queryFn: async () => {
      let data = await fetchSubstitutionData(new Date("2024-05-21"), "classes");
      return data;
    },
    queryKey: ["substitutions"]
  });

  const scheme = useColorScheme();

  return (
    <View style={{ marginTop: 64, backgroundColor: getBackgroundColor(scheme) }}>
      {substitutionsQuery.isLoading && <Text style={{ color: getTextColor(scheme) }}>Ładowanie...</Text>}
      {substitutionsQuery.isError && (
        <View>
          <Text style={{ color: getTextColor(scheme) }}>{substitutionsQuery.error.message}</Text>
        </View>
      )}
      <FlatList
        data={substitutionsQuery.data}
        contentContainerStyle={{ gap: 16 }}
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
                    backgroundColor: "lightgray",
                    borderRadius: 8,
                    marginHorizontal: 8,
                    padding: 8
                  }}
                >
                  <MaterialIcons name="do-not-disturb" size={24} color="red" />
                  <Text>Nieobecność</Text>
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
