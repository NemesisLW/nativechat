import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "(tabs)",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Chikers: require("../assets/fonts/CHIKERS.ttf"),
    Harajaku: require("../assets/fonts/HarajukuRegular-ZVxV3.ttf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ConvexProvider client={convex}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#2563EB" },
            headerTintColor: "white",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerTitle: "AI Coaches",
              headerRight: () => (
                <Link href={"/(modal)/create"} asChild>
                  <TouchableOpacity>
                    <Ionicons name="add" size={32} color="white"></Ionicons>
                  </TouchableOpacity>
                </Link>
              ),
            }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(modal)/create"
            options={{
              headerTitle: "Create New Chat",
              presentation: "modal",
              headerShown: true,
              headerRight: () => (
                <Link href={"/(modal)/create"} asChild>
                  <TouchableOpacity>
                    <Ionicons
                      name="close-outline"
                      size={32}
                      color="white"
                    ></Ionicons>
                  </TouchableOpacity>
                </Link>
              ),
            }}
          />
          <Stack.Screen name="(chat)/[chatid]" options={{ headerTitle: "" }} />
        </Stack>
      </ThemeProvider>
    </ConvexProvider>
  );
}
