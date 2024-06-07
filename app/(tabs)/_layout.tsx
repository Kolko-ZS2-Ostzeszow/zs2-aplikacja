import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable } from "react-native";
import { throttle } from "../utils/throttle";

export default function TabLayout() {
  const router = useRouter();

  const settingsPressed = useCallback(
    throttle(() => {
      router.push("settings");
    }, 100),
    []
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue",
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Plan",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="calendar" color={color} />
        }}
      />
      <Tabs.Screen
        name="substitutions"
        options={{
          title: "Zastępstwa",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="user-times" color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarButton: (props) => (
            <Pressable
              onPress={() => {
                settingsPressed();
              }}
              style={{
                justifyContent: "center",
                paddingHorizontal: 24
              }}
            >
              <FontAwesome size={24} name="cog" color="gray" />
            </Pressable>
          )
        }}
      />
    </Tabs>
  );
}
