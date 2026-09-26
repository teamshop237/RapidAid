import { ProtocolTable } from "@/components/ProtocolTable";
import { localWorkflow } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default function ReviewQueuePage() {
  const protocols = localWorkflow.service.listProtocols().filter((aggregate) => {
    const current = aggregate.versions.find((version) => version.contentVersion === aggregate.currentVersion)!;
    return current.state === "in-clinical-review" || current.state === "clinically-reviewed";
  });
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">Qualified clinician</p><h1>Clinical-review queue</h1><p>Review and approval remain distinct checksum-bound actions.</p></div></div>
      <section className="panel"><ProtocolTable protocols={protocols} emptyMessage="No protocol currently requires clinical review or approval." /></section>
    </>
  );
}
