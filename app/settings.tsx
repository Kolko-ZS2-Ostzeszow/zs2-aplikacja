import { Appearance, ColorSchemeName, Text, View, useColorScheme } from "react-native";
import { RadioGroup } from "./components/radio_group";
import { getTextColor } from "./utils/color";

export default function Settings() {
  const scheme = useColorScheme();

  return (
    <View>
      <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 16, fontWeight: 700 }}>Motyw</Text>
      <View>
        <RadioGroup
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
            Appearance.setColorScheme(value);
          }}
        />
      </View>
    </View>
  );
}
