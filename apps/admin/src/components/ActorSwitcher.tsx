import { setLocalActorAction } from "@/app/actions";
import { roleLabels } from "@/lib/format";
import { localHumanActors } from "@/lib/localAuth";

export function ActorSwitcher({ actorId }: { actorId: string }) {
  return (
    <form action={setLocalActorAction} className="actor-switcher">
      <label htmlFor="actor">Local role</label>
      <select id="actor" name="actorId" defaultValue={actorId}>
        {localHumanActors.map((actor) => (
          <option key={actor.actorId} value={actor.actorId}>{roleLabels[actor.role]} · {actor.displayName}</option>
        ))}
      </select>
      <button className="button button-secondary" type="submit">Switch</button>
    </form>
  );
}
