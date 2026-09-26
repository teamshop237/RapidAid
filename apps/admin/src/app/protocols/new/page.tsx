import { createDraftAction } from "@/app/actions";
import { Notice } from "@/components/Notice";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewProtocolPage({ searchParams }: Props) {
  const { error } = await searchParams;
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">Content editor</p><h1>New synthetic draft</h1><p>Creates local non-medical workflow content only.</p></div></div>
      <Notice message={error} tone="error" />
      <form action={createDraftAction} className="panel form-stack">
        <label>Stable protocol ID<input name="protocolId" defaultValue="protocol.synthetic.workflow.beta" required pattern="[a-z][a-z0-9.-]+" /></label>
        <div className="language-grid">
          <label>English title<input name="titleEn" defaultValue="Synthetic workflow Beta — not medical guidance" required /></label>
          <label>French title<input name="titleFr" defaultValue="Flux synthétique Bêta — aucun conseil médical" required /></label>
          <label>English summary<textarea name="summaryEn" rows={3} defaultValue="Synthetic administrative fixture only. Do not take action." required /></label>
          <label>French summary<textarea name="summaryFr" rows={3} defaultValue="Exemple administratif synthétique uniquement. Ne pas agir." required /></label>
        </div>
        <div className="safety-strip">The remaining source and section fields use unmistakably synthetic local fixture data.</div>
        <button className="button button-primary" type="submit">Create draft</button>
      </form>
    </>
  );
}
