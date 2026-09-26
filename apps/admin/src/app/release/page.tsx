import { ProtocolTable } from "@/components/ProtocolTable";
import { localWorkflow } from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default function ReleaseQueuePage() {
  const protocols = localWorkflow.service.listProtocols().filter((aggregate) => {
    const current = aggregate.versions.find((version) => version.contentVersion === aggregate.currentVersion)!;
    return current.state === "technically-validated";
  });
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">Human release authority</p><h1>Release-approval queue</h1><p>Only technically validated, clinically approved content appears here.</p></div></div>
      <section className="panel"><ProtocolTable protocols={protocols} emptyMessage="No protocol currently awaits release approval." /></section>
    </>
  );
}
