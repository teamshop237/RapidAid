import { router } from "expo-router";

import { GuidesScreen } from "@/screens/GuidesScreen";

export default function GuidesRoute() {
  return (
    <GuidesScreen
      onOpenGuide={(id) => router.push({ pathname: "/guide/[id]", params: { id } })}
    />
  );
}
