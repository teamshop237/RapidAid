import type { AuthenticatedActor } from "@rapidaid/content-workflow";
import { syntheticActors } from "@rapidaid/content-workflow/testing";
import { cookies } from "next/headers";

export const localHumanActors = [
  syntheticActors.editor,
  syntheticActors.reviewer,
  syntheticActors.administrator,
  syntheticActors.releaseManager,
] as const;

const actorsById = new Map<string, AuthenticatedActor>(localHumanActors.map((actor) => [actor.actorId, actor]));

export async function getCurrentActor(): Promise<AuthenticatedActor> {
  const cookieStore = await cookies();
  const actorId = cookieStore.get("rapidaid-admin-actor")?.value;
  return actorsById.get(actorId ?? "") ?? syntheticActors.editor;
}

export function getLocalHumanActor(actorId: string): AuthenticatedActor | null {
  return actorsById.get(actorId) ?? null;
}
