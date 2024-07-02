import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { throttle } from "../utils/throttle";
import { getBackgroundColor } from "../utils/color";
import { Accent1 } from "../theme";

export default function TabLayout() {
  const router = useRouter();
  const scheme = useColorScheme();

  const settingsPressed = throttle(() => {
    router.push("settings");
  }, 100);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "#a3a3a3",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Accent1,
          borderColor: "black",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16
        }
      }}
      sceneContainerStyle={{
        backgroundColor: getBackgroundColor(scheme)
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
              <FontAwesome size={24} name="cog" color="#a3a3a3" />
            </Pressable>
          )
        }}
      />
    </Tabs>
  );
}
