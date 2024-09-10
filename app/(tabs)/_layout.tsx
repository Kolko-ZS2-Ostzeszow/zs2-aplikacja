import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router, Tabs } from "expo-router";
import { Pressable, useColorScheme } from "react-native";
import { getBackgroundColor } from "../utils/color";
import { Accent1 } from "../theme";

export default function TabLayout() {
  const scheme = useColorScheme();

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
          headerShown: true,
          title: "Ustawienia",
          headerTintColor: "white",
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="cog" color={color} />,
          headerStyle: {
            backgroundColor: Accent1
          },
          headerLeft: (props) => {
            return (
              <Pressable
                android_ripple={{
                  color: "#ffffff77",
                  radius: 18,
                  borderless: true,
                  foreground: true
                }}
                style={{
                  marginLeft: 12
                }}
                onPress={() => router.back()}
              >
                <FontAwesome size={24} name="long-arrow-left" color={"white"}></FontAwesome>
              </Pressable>
            );
          },
          tabBarStyle: {
            display: "none"
          },
          tabBarLabelStyle: {
            display: "none"
          },
          tabBarItemStyle: {
            flexGrow: 1,
            maxWidth: 60
          }
        }}
      />
    </Tabs>
  );
}
