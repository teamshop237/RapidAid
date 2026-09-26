import { formatTimestamp, roleLabels } from "@/lib/format";
import { localWorkflow } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default function AuditPage() {
  const events = [...localWorkflow.service.listAudit()].reverse();
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">Append-only history</p><h1>Audit history</h1><p>Safety-relevant local actions recorded in execution order.</p></div></div>
      <section className="panel audit-list">
        {events.map((event) => (
          <article key={event.eventId}>
            <div><strong>{event.action}</strong><span>{event.protocolId} · {event.contentVersion}</span></div>
            <div><span>{event.actorDisplayName} · {roleLabels[event.role]}</span><time>{formatTimestamp(event.timestamp)}</time></div>
            {event.contentChecksum && <code>{event.contentChecksum}</code>}
          </article>
        ))}
      </section>
    </>
  );
}
