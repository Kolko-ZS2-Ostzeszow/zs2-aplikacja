import { ErrorBoundaryProps, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  //TODO: Automatically send errors to us
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black", justifyContent: "space-between" }}>
      <Text
        style={{
          color: "white",
          textAlign: "left",
          fontWeight: "700",
          fontSize: 36,
          marginHorizontal: 8,
          marginBottom: 16,
          marginTop: 4
        }}
      >
        Wystąpił błąd
      </Text>
      <View
        style={{
          backgroundColor: "#222222",
          marginHorizontal: 16,
          padding: 2,
          flex: 1,
          marginBottom: 16,
          marginTop: 8
        }}
      >
        <Text style={{ color: "white", fontFamily: "monospace", borderBottomColor: "gray", borderBottomWidth: 1 }}>
          {error.message}
        </Text>
        <ScrollView style={{ padding: 1 }}>
          <Text style={{ color: "white", fontFamily: "monospace" }}>{error.stack}</Text>
        </ScrollView>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 32 }}>
        <Pressable
          style={({ pressed }) => (pressed ? { backgroundColor: "#444444" } : { backgroundColor: "#222222" })}
          onPress={retry}
        >
          <Text style={{ color: "white", padding: 16 }}>Odśwież</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => (pressed ? { backgroundColor: "#444444" } : { backgroundColor: "#222222" })}
          onPress={() =>
            router.navigate(
              `/error_reporting?errorParam=${encodeURIComponent(JSON.stringify({ name: error.name, message: error.message, cause: error.cause, stack: error.stack }))}`
            )
          }
        >
          <Text style={{ color: "white", padding: 16 }}>Zgłoś błąd</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => (pressed ? { backgroundColor: "#444444" } : { backgroundColor: "#222222" })}
          onPress={() => Clipboard.setStringAsync(`Message: ${error.message}\nStack: ${error.stack}`)}
        >
          <Text style={{ color: "white", padding: 16 }}>Kopiuj błąd</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
