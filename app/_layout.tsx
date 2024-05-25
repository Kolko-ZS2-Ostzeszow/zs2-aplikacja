import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

var queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}></Stack.Screen>
        <Stack.Screen name="settings" options={{ title: "Settings" }}></Stack.Screen>
      </Stack>
    </QueryClientProvider>
  );
}
