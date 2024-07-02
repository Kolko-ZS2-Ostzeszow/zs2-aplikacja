import { Pressable, View, Text, ViewStyle, TextStyle } from "react-native";
import { Accent1 } from "../theme";
import { useState } from "react";

interface RadioGroupProps {
  data: { label: string; value: string }[];
  initialvalue?: number;
  onSelect?: (value: string) => void;
  containerStyle?: ViewStyle;
  radioContainerStyle?: ViewStyle;
  radioButtonStyle?: ViewStyle;
  radioButtonIndicatorStyle?: ViewStyle;
  radioTextStyle?: TextStyle;
}

export function RadioGroup(props: RadioGroupProps) {
  let containerStyle = props.containerStyle ?? {
    gap: 8
  };

  let radioContainerStyle = props.radioContainerStyle ?? {
    gap: 8,
    flexDirection: "row",
    alignItems: "center"
  };

  let radioButtonStyle = props.radioButtonStyle ?? {
    borderColor: Accent1,
    borderWidth: 2,
    borderRadius: 16,
    width: 32,
    height: 32,
    padding: 2
  };

  let radioButtonIndicatorStyle = props.radioButtonIndicatorStyle ?? {
    backgroundColor: Accent1,
    width: "100%",
    height: "100%",
    borderRadius: 16
  };

  let radioTextStyle = props.radioTextStyle ?? {
    fontSize: 16
  };

  const [selected, setSelected] = useState(props.initialvalue ?? 0);

  return (
    <View style={containerStyle}>
      {props.data.map((data, i) => {
        return (
          <View key={JSON.stringify(data)} style={radioContainerStyle}>
            <Pressable
              style={radioButtonStyle}
              onPress={() => {
                setSelected(i);
                if (props.onSelect != null) props.onSelect(data.value);
              }}
            >
              <View style={{ ...radioButtonIndicatorStyle, display: selected === i ? "flex" : "none" }}></View>
            </Pressable>
            <Text style={radioTextStyle}>{data.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
