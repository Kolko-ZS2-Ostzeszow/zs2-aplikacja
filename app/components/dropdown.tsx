import React from "react";
import { StyleSheet, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface DropdownProps {
  data: { label: string; value: number }[];
  externalValue: any;
  setExternalValue: (value: number) => void;
}

const DropdownComponent = (props: DropdownProps) => {
  return (
    <Dropdown
      style={styles.dropdown}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={props.data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder="Select item"
      searchPlaceholder="Search..."
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
          placeholder="Search..."
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
