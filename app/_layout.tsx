import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    InterBlack: require("../assets/fonts/Inter_18pt-Medium.ttf"),
    InterBold: require("../assets/fonts/Inter_24pt-Bold.ttf"),
    InterRegular: require("../assets/fonts/Inter_28pt-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
