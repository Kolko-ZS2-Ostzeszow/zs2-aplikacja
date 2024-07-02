import { ColorSchemeName } from "react-native";
import { DarkBg } from "../theme";

export function getTextColor(scheme: ColorSchemeName) {
  return scheme === "light" ? "black" : "white";
}

export function getBackgroundColor(scheme: ColorSchemeName) {
  return scheme === "light" ? "#fff" : DarkBg;
}
