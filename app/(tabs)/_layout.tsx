import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function TabLayout() {
  const router = useRouter();

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
                router.push("settings");
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
