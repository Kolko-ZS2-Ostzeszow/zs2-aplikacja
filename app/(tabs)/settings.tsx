import { Appearance, ColorSchemeName, Linking, Pressable, Text, View, useColorScheme } from "react-native";
import { RadioGroup } from "../../src/components/radio_group";
import { getTextColor } from "../../src/misc/color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { setStatusBarStyle } from "expo-status-bar";
import { UpdateContext } from "../_layout";
import { useContext } from "react";
import { Accent1 } from "../../src/theme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { updateApiUrl } from "../../config";

export default function Settings() {
  const scheme = useColorScheme();
  const updateQuery = useContext(UpdateContext);
  const savedSelectedTheme = useQuery({
    queryFn: async () => {
      return JSON.parse(await AsyncStorage.getItem("theme"));
    },
    queryKey: ["theme"]
  });

  return (
    <View>
      <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 16, fontWeight: 700 }}>Motyw</Text>
      <View style={{ marginBottom: 8 }}>
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
      <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 16, fontWeight: 700 }}>Aktualizacje</Text>
      <View>
        {updateQuery.data != null && (
          <View>
            <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 14, paddingBottom: 0 }}>
              Dostępna jest nowa aktualizacja
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 14 }}>{updateQuery.data?.current}</Text>
              <FontAwesome
                size={24}
                name="long-arrow-right"
                color={"white"}
                style={{ alignSelf: "center" }}
              ></FontAwesome>
              <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 14 }}>{updateQuery.data?.new}</Text>
            </View>
            <Pressable
              style={{ padding: 8, backgroundColor: Accent1, marginHorizontal: 16, borderRadius: 8 }}
              android_ripple={{ radius: 190, color: "#ffffff77" }}
              onPress={() => Linking.openURL(updateApiUrl + "/download")}
            >
              <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 14, textAlign: "center" }}>
                Pobierz
              </Text>
            </Pressable>
          </View>
        )}
        {updateQuery.data == null && (
          <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 14 }}>
            Nie ma żadnych nowych aktualizacji
          </Text>
        )}
      </View>
    </View>
  );
}
