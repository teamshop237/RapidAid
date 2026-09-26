import { router } from "expo-router";

import { EmergencyServicesScreen } from "@/screens/EmergencyServicesScreen";

export default function EmergencyServicesRoute() {
  return <EmergencyServicesScreen onGuides={() => router.push("/guides")} />;
}
