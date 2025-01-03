import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { Appearance, useColorScheme } from "react-native";
import { getBackgroundColor } from "../src/misc/color";
import { Accent1 } from "../src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { Try } from "expo-router/build/views/Try";
import { ErrorBoundary } from "../src/misc/error_boundary";
import { ScheduleData } from "../src/misc/edupage";

SplashScreen.preventAutoHideAsync();

var queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      //TODO: add sending errors to backend here
    }
  })
});
queryClient.prefetchQuery({
  queryFn: async () => {
    const cachedDataJson = await AsyncStorage.getItem("data-cache");

    if (cachedDataJson == null) return null;

    return JSON.parse(cachedDataJson) as ScheduleData;
  },
  queryKey: ["schedule-cache"]
});

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
    <>
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
      <StatusBar translucent={true} style="light"></StatusBar>
    </>
  );
}
