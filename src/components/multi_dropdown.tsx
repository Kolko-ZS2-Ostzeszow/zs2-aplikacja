import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";

interface MultiDropdownProps {
  data: { label: string; value: number }[];
  setExternalValue: (value: number[]) => void;
  placeholder: string;
}

const MultiDropdownComponent = (props: MultiDropdownProps) => {
  const [value, setValue] = useState(null);

  return (
    <MultiSelect
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
      placeholder={props.placeholder}
      searchPlaceholder="Search..."
      value={value}
      onChange={(item) => {
        setValue(item);
        props.setExternalValue(item.map((i) => parseInt(i)));
      }}
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
    fontSize: 16
  }
});
