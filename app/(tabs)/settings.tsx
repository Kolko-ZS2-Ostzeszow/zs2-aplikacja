import { Appearance, ColorSchemeName, Text, View, useColorScheme } from "react-native";
import { RadioGroup } from "../components/radio_group";
import { getTextColor } from "../utils/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { setStatusBarStyle } from "expo-status-bar";

export default function Settings() {
  const scheme = useColorScheme();
  const savedSelectedTheme = useQuery({
    queryFn: async () => {
      return JSON.parse(await AsyncStorage.getItem("theme"));
    },
    queryKey: ["theme"]
  });

  return (
    <View>
      <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 16, fontWeight: 700 }}>Motyw</Text>
      <View>
        <RadioGroup
          initialvalue={savedSelectedTheme.data == null ? 0 : savedSelectedTheme.data === "light" ? 1 : 2}
          data={[
            {
              label: "Systemowy",
              value: null
            },
            {
              label: "Jasny",
              value: "light"
            },
            {
              label: "Ciemny",
              value: "dark"
            }
          ]}
          containerStyle={{
            flexDirection: "row",
            justifyContent: "space-evenly"
          }}
          radioTextStyle={{
            color: getTextColor(scheme)
          }}
          onSelect={(value: ColorSchemeName) => {
            AsyncStorage.setItem("theme", JSON.stringify(value));
            savedSelectedTheme.refetch();
            Appearance.setColorScheme(value);
            setTimeout(() => {
              setStatusBarStyle("light");
            }, 0);
          }}
        />
      </View>
    </View>
  );
}
