import { router } from "expo-router";

import { HomeScreen } from "@/screens/HomeScreen";

export default function HomeRoute() {
  return (
    <HomeScreen
      onEmergency={() => router.push("/emergency-services")}
      onGuides={() => router.push("/guides")}
    />
  );
}
