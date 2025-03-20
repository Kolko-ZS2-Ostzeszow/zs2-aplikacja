import { DefinedUseQueryResult, QueryCache, QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { Appearance, useColorScheme } from "react-native";
import { getBackgroundColor } from "../src/misc/color";
import { Accent1 } from "../src/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect } from "react";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { Try } from "expo-router/build/views/Try";
import { ErrorBoundary } from "../src/misc/error_boundary";
import { ScheduleData } from "../src/misc/edupage";
import { updateApiUrl } from "../config";
import { nativeApplicationVersion } from "expo-application";

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

export const UpdateContext =
  createContext<DefinedUseQueryResult<{ current: string; new: string; shouldUpdate: boolean } | null>>(null);

const UpdateProvider = ({ children }) => {
  const updateQuery = useQuery(
    {
      queryFn: async () => {
        try {
          if (updateApiUrl == null || updateApiUrl == undefined || updateApiUrl.trim() == "") return null;

          const updateInfo = await (await fetch(updateApiUrl + "/info")).json();

          return {
            current: nativeApplicationVersion,
            new: updateInfo.version,
            shouldUpdate: nativeApplicationVersion != updateInfo.version
          };
        } catch (error) {
          return null;
        }
      },
      initialData: null,
      queryKey: ["update"]
    },
    queryClient
  );
  return <UpdateContext.Provider value={updateQuery}>{children}</UpdateContext.Provider>;
};

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
      <UpdateProvider>
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
      </UpdateProvider>
      <StatusBar translucent={true} style="light"></StatusBar>
    </>
  );
}
