import type { ProtocolAggregate } from "@rapidaid/content-workflow";
import Link from "next/link";

import { StatusBadge } from "@/components/StatusBadge";
import { formatTimestamp } from "@/lib/format";

export function ProtocolTable({ protocols, emptyMessage }: { protocols: readonly ProtocolAggregate[]; emptyMessage: string }) {
  if (protocols.length === 0) return <div className="empty-state">{emptyMessage}</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Protocol</th><th>Version</th><th>Status</th><th>Updated</th><th><span className="sr-only">Open</span></th></tr>
        </thead>
        <tbody>
          {protocols.map((aggregate) => {
            const current = aggregate.versions.find((version) => version.contentVersion === aggregate.currentVersion)!;
            return (
              <tr key={aggregate.protocolId}>
                <td><strong>{current.content.title.en}</strong><small>{aggregate.protocolId}</small></td>
                <td>{current.contentVersion}</td>
                <td><StatusBadge state={current.state} /></td>
                <td>{formatTimestamp(current.updatedAt)}</td>
                <td><Link className="text-link" href={`/protocols/${aggregate.protocolId}/${current.contentVersion}`}>Open</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
