import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { getBackgroundColor } from "./utils/color";
import { Accent1 } from "./theme";

var queryClient = new QueryClient();

export default function Layout() {
  const scheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: getBackgroundColor(scheme) },
          headerStyle: { backgroundColor: Accent1 },
          headerTintColor: "white"
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="settings" options={{ title: "Settings" }}></Stack.Screen>
      </Stack>
    </QueryClientProvider>
  );
}
