import React from "react";
import { StyleSheet, TextInput, TextStyle, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface DropdownProps {
  data: { label: string; value: number }[];
  externalValue: any;
  setExternalValue: (value: number) => void;
  placeholder: string;
  searchPlaceholder?: string;
  style?: ViewStyle;
  placeholderStyle?: TextStyle;
  search?: boolean;
}

const DropdownComponent = (props: DropdownProps) => {
  return (
    <Dropdown
      style={props.style ? props.style : styles.dropdown}
      placeholderStyle={props.placeholderStyle ? props.placeholderStyle : styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={props.data}
      search={props.search}
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={props.placeholder}
      searchPlaceholder={props.searchPlaceholder}
      value={props.externalValue}
      onChange={(item) => {
        props.setExternalValue(item.value);
      }}
      renderInputSearch={(onSearch) => (
        <TextInput
          style={styles.inputSearchStyle}
          onChangeText={(text) => {
            onSearch(text);
          }}
          placeholder={props.searchPlaceholder}
        ></TextInput>
      )}
    />
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "lightgray",
    borderBottomWidth: 0.5
  },
  icon: {
    marginRight: 5
  },
  placeholderStyle: {
    fontSize: 16,
    color: "white"
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "white"
  },
  iconStyle: {
    width: 20,
    height: 20
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderColor: "lightgray",
    borderWidth: 0.5,
    margin: 8,
    padding: 8
  }
});
