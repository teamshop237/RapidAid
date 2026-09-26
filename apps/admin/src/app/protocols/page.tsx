import Link from "next/link";

import { Notice } from "@/components/Notice";
import { ProtocolTable } from "@/components/ProtocolTable";
import { localWorkflow } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function ProtocolsPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const protocols = localWorkflow.service.listProtocols();
  return (
    <>
      <div className="page-header">
        <div><p className="eyebrow">Medical content</p><h1>Protocols</h1><p>Controlled source drafts and approval status. ODERSA imports remain unapproved until human review is complete.</p></div>
        <Link className="button button-primary" href="/protocols/new">New synthetic draft</Link>
      </div>
      <Notice message={error} tone="error" />
      <section className="panel">
        <div className="panel-heading"><h2>All protocols</h2><span>{protocols.length} record{protocols.length === 1 ? "" : "s"}</span></div>
        <ProtocolTable protocols={protocols} emptyMessage="No local protocol drafts exist." />
      </section>
    </>
  );
}
