import React from "react";
import { StyleSheet, TextInput, TextStyle } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";

interface MultiDropdownProps {
  data: { label: string; value: number }[];
  externalValue: any[];
  setExternalValue: (value: number[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  placeholderStyle?: TextStyle;
}

const MultiDropdownComponent = (props: MultiDropdownProps) => {
  return (
    <MultiSelect
      style={styles.dropdown}
      placeholderStyle={props.placeholderStyle ? props.placeholderStyle : styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      iconStyle={styles.iconStyle}
      data={props.data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={props.placeholder}
      value={props.externalValue}
      onChange={(item) => {
        props.setExternalValue(item.map((i) => parseInt(i)));
      }}
      inside={true}
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

export default MultiDropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5
  },
  icon: {
    marginRight: 5
  },
  placeholderStyle: {
    fontSize: 16
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
