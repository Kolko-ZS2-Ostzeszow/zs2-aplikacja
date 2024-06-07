import { useQuery } from "@tanstack/react-query";
import { fetchSubstitutionData } from "../utils/edupage";
import { FlatList, Text, View } from "react-native";

export default function Substitutions() {
  const substitutionsQuery = useQuery({
    queryFn: async () => {
      let data = await fetchSubstitutionData(new Date("2024-05-21"), "classes");
      return data;
    },
    queryKey: ["substitutions"]
  });

  return (
    <View style={{ marginTop: 64 }}>
      {substitutionsQuery.isLoading && <Text>Ładowanie...</Text>}
      {substitutionsQuery.isError && (
        <View>
          <Text>{substitutionsQuery.error.message}</Text>
        </View>
      )}
      <FlatList
        data={substitutionsQuery.data}
        contentContainerStyle={{ gap: 16 }}
        renderItem={(data) => {
          return (
            <View>
              <Text>{data.item.className}</Text>
              {data.item.isAbsent && <Text>Nieobecność</Text>}
              {!data.item.isAbsent &&
                data.item.rows.map((row) => (
                  <View key={JSON.stringify(row)} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <Text>{row.period}</Text>
                      <Text>{row.groups.join(", ")}</Text>
                    </View>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      {row.type === "cancel" && <Text>Anulowano {row.info}</Text>}
                      {row.type === "change" && (
                        <View>
                          <Text>Zmiana {row.info}</Text>
                          <View>
                            {row.diff.classroom && (
                              <Text>{row.diff.classroom.original + " -> " + row.diff.classroom.replacement}</Text>
                            )}
                            {row.diff.teacher && (
                              <Text>
                                {row.diff.teacher.original +
                                  (row.diff.teacher.replacement ? " -> " + row.diff.teacher.replacement : "")}
                              </Text>
                            )}
                            {row.diff.subject && (
                              <Text>
                                {row.diff.subject.original +
                                  (row.diff.subject.replacement ? " -> " + row.diff.subject.replacement : "")}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
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
