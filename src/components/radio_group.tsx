import { Pressable, View, Text, ViewStyle, TextStyle, LayoutAnimation } from "react-native";
import { Accent1 } from "../theme";
import { useState } from "react";
import Animated, { EntryAnimationsValues, useSharedValue, withTiming, ZoomIn, ZoomOut } from "react-native-reanimated";

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
  const haventInteractedWithButton = useSharedValue(true);

  const entering = () => {
    "worklet";
    const animations = haventInteractedWithButton.value
      ? {}
      : {
          transform: [
            {
              scale: withTiming(1, {
                duration: 150
              })
            }
          ]
        };
    const initialValues = haventInteractedWithButton.value
      ? {
          transform: [
            {
              scale: 1
            }
          ]
        }
      : {
          transform: [
            {
              scale: 0
            }
          ]
        };
    return {
      initialValues,
      animations
    };
  };

  return (
    <View style={containerStyle}>
      {props.data.map((data, i) => {
        return (
          <View key={JSON.stringify(data)} style={radioContainerStyle}>
            <Pressable
              style={radioButtonStyle}
              onPress={() => {
                // eslint-disable-next-line react-compiler/react-compiler
                haventInteractedWithButton.value = false;
                setSelected(i);
                if (props.onSelect != null) props.onSelect(data.value);
              }}
            >
              <Animated.View
                key={selected}
                entering={entering}
                exiting={ZoomOut.duration(150)}
                style={{ ...radioButtonIndicatorStyle, display: selected === i ? "flex" : "none" }}
              ></Animated.View>
            </Pressable>
            <Text style={radioTextStyle}>{data.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
