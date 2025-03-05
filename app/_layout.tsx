import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#8c2b2b', 
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold', 
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: "Home" }} />
        <Stack.Screen name="movie/[movieId]" options={{ headerTitle: "Detalhes" }} />
      </Stack>
    </View>
  );
}