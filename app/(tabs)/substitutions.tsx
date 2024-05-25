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
    <View>
      <FlatList
        data={substitutionsQuery.data}
        renderItem={(data) => {
          return (
            <View>
              <Text>{data.item.className}</Text>
              {data.item.rows.map((row) => {
                return (
                  <View>
                    <Text>{row.period}</Text>
                    <Text>{row.hours}</Text>
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
