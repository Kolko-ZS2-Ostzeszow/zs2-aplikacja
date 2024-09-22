import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { Appearance, Platform, UIManager, useColorScheme } from "react-native";
import { getBackgroundColor } from "./utils/color";
import { Accent1 } from "./theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { setStatusBarStyle } from "expo-status-bar";
import { Try } from "expo-router/build/views/Try";
import { ErrorBoundary } from "./utils/error_boundary";

SplashScreen.preventAutoHideAsync();

var queryClient = new QueryClient();

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Layout() {
  const scheme = useColorScheme();

  useEffect(() => {
    async function prepare() {
      let savedTheme = await queryClient.fetchQuery({
        queryFn: async () => {
          return JSON.parse(await AsyncStorage.getItem("theme"));
        },
        queryKey: ["theme"]
      });

      Appearance.setColorScheme(savedTheme);

      setTimeout(() => {
        setStatusBarStyle("light");
      }, 0);

      SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  return (
    <Try catch={ErrorBoundary}>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: getBackgroundColor(scheme) },
            headerStyle: { backgroundColor: Accent1 },
            headerTintColor: "white"
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }}></Stack.Screen>
        </Stack>
      </QueryClientProvider>
    </Try>
  );
}
