import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { ScheduleData, fetchEdupageData } from "./utils/edupage";
import { useState } from "react";

export default function App() {
  let [schedule, setSchedule] = useState<ScheduleData>();

  fetchEdupageData().then((data) => setSchedule(data));

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
