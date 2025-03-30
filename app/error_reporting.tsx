import { ActivityIndicator, Pressable, Text, TextInput, useColorScheme, View } from "react-native";
import DropdownComponent from "../src/components/dropdown";
import { useMemo, useRef, useState } from "react";
import { getTextColor } from "../src/misc/color";
import { Accent1 } from "../src/theme";
import { useMutation } from "@tanstack/react-query";
import { reportingApiUrl } from "../config";
import { throttle } from "../src/misc/throttle";
import { nativeApplicationVersion } from "expo-application";
import { useLocalSearchParams } from "expo-router";

export default function ErrorReporting() {
  const categories = [
    { value: 0, label: "Plan lekcji" },
    { value: 1, label: "Zastępstwa" },
    { value: 2, label: "Inne" }
  ];
  const [currentCategory, setCurrentCategory] = useState(null);
  const [description, setDescription] = useState<string>("");
  const scheme = useColorScheme();
  const descriptionInput = useRef<TextInput>();
  const submitButton = useRef<View>();
  const reportMutation = useMutation({
    mutationFn: async () => {
      const reportResponse = await fetch(reportingApiUrl, {
        body: JSON.stringify({
          category: currentCategory,
          description: description.trim(),
          version: nativeApplicationVersion,
          error: error ? JSON.stringify(error) : undefined
        }),
        method: "POST"
      });
      if (!reportResponse.ok) throw new Error(await reportResponse.text());

      return reportResponse;
    }
  });
  const { errorParam } = useLocalSearchParams<{ errorParam: string }>();

  const error = useMemo(() => (errorParam ? JSON.parse(errorParam) : undefined), [errorParam]);

  const onSubmit = throttle(() => {
    if (reportMutation.isPending) return;

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 8 || trimmedDescription.length > 2000) {
      descriptionInput.current.setNativeProps({
        style: {
          borderColor: "red"
        }
      });
      return;
    }

    descriptionInput.current.setNativeProps({
      style: {
        borderColor: "gray"
      }
    });

    reportMutation.mutate(null);
  }, 100);

  return (
    <View>
      {!reportMutation.isSuccess && (
        <View>
          <Text style={{ color: getTextColor(scheme), padding: 8, fontSize: 16, fontWeight: 700 }}>
            Wybierz kategorię
          </Text>
          <DropdownComponent
            data={categories}
            externalValue={currentCategory}
            setExternalValue={setCurrentCategory}
            placeholder=""
            style={{
              marginHorizontal: 8,
              height: 50,
              borderColor: "gray",
              borderWidth: 0.5,
              padding: 8,
              borderRadius: 8
            }}
          ></DropdownComponent>
          {currentCategory != null && (
            <View>
              <View style={{ borderBottomColor: "gray", borderBottomWidth: 0.5, margin: 24 }}></View>
              {/*  */}
              <Text style={{ color: getTextColor(scheme), paddingHorizontal: 8, fontSize: 16, fontWeight: 700 }}>
                Opisz błąd
              </Text>
              <Text style={{ marginHorizontal: 8, color: "gray", marginTop: 4 }}>
                Minimum 8 znaków • Maximum 2000 znaków
              </Text>
              <TextInput
                ref={descriptionInput}
                multiline
                style={{
                  marginHorizontal: 8,
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 8,
                  borderColor: "gray",
                  borderWidth: 0.5,
                  color: getTextColor(scheme),
                  minHeight: 50,
                  maxHeight: 300
                }}
                maxLength={2000}
                onChangeText={(text) => {
                  setDescription(text);
                }}
              ></TextInput>
              {error && (
                <View>
                  <Text style={{ color: getTextColor(scheme), paddingHorizontal: 8, fontSize: 16, fontWeight: 700 }}>
                    Dziennik błędu
                  </Text>
                  <Text style={{ color: getTextColor(scheme), paddingHorizontal: 8 }}>
                    Do raportu został dodany dziennik błędu.
                  </Text>
                </View>
              )}
              <View style={{ margin: 8, borderRadius: 8, overflow: "hidden" }}>
                <Pressable
                  style={{ backgroundColor: Accent1, padding: 12, borderRadius: 8 }}
                  android_ripple={{ radius: 200, color: "#ffffff77" }}
                  onPress={onSubmit}
                  ref={submitButton}
                >
                  {reportMutation.isPending && <ActivityIndicator />}
                  {!reportMutation.isPending && <Text style={{ color: "white", textAlign: "center" }}>Wyślij</Text>}
                </Pressable>
              </View>
              {reportMutation.isError && (
                <Text style={{ color: getTextColor(scheme), textAlign: "center" }}>
                  Wystąpił błąd: {reportMutation.error.message}
                </Text>
              )}
            </View>
          )}
        </View>
      )}
      {reportMutation.isSuccess && (
        <View>
          <Text style={{ fontSize: 144, textAlign: "center", margin: 64 }}>😍</Text>
          <Text style={{ fontSize: 32, textAlign: "center", marginHorizontal: 16, color: getTextColor(scheme) }}>
            Dziękujemy za twoje zgłoszenie. Pomoże je nam w ulepszeniu aplikacji.
          </Text>
        </View>
      )}
    </View>
  );
}
