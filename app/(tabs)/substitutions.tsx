import { useQuery } from "@tanstack/react-query";
import { fetchSubstitutionData } from "../utils/edupage";
import { FlatList, Text, View } from "react-native";

export default function Substitutions() {
  const substitutionsQuery = useQuery({
    queryFn: async () => {
      let data = await fetchSubstitutionData(new Date("2024-05-24"), "classes");
      return data;
    },
    queryKey: ["substitutions"]
  });

  return (
    <View style={{ marginTop: 64 }}>
      <FlatList
        data={substitutionsQuery.data}
        contentContainerStyle={{ gap: 10 }}
        renderItem={(data) => {
          return (
            <View style={{}}>
              <Text>{data.item.className}</Text>
              {data.item.rows.map((row) => {
                return (
                  <View key={row.period + row.hours + row.info}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <Text>{row.period}</Text>
                      <Text>{row.hours}</Text>
                    </View>
                    <Text>{row.info}</Text>
                  </View>
                );
              })}
            </View>
          );
        }}
      ></FlatList>
    </View>
  );
}
