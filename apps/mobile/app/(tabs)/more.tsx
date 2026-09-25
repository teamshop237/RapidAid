import { router } from "expo-router";

import { MoreScreen } from "@/screens/MoreScreen";

export default function MoreRoute() {
  return <MoreScreen onAppInfo={() => router.push("/app-info")} onPrivacy={() => router.push("/privacy")} />;
}
