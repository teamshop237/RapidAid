import Link from "next/link";
import { notFound } from "next/navigation";

import {
  clinicalApproveAction,
  completeReviewAction,
  editDraftAction,
  generateCandidateAction,
  releaseApproveAction,
  requestChangesAction,
  submitReviewAction,
  technicalValidateAction,
} from "@/app/actions";
import { Notice } from "@/components/Notice";
import { StatusBadge } from "@/components/StatusBadge";
import { formatTimestamp, roleLabels, stateLabels } from "@/lib/format";
import { getCurrentActor } from "@/lib/localAuth";
import { localWorkflow } from "@/lib/workflow";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ protocolId: string; version: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
};

function ActionFields({ protocolId, version, checksum }: { protocolId: string; version: string; checksum: string }) {
  return (
    <>
      <input type="hidden" name="protocolId" value={protocolId} />
      <input type="hidden" name="contentVersion" value={version} />
      <input type="hidden" name="contentChecksum" value={checksum} />
    </>
  );
}

export default async function ProtocolDetailPage({ params, searchParams }: Props) {
  const [{ protocolId, version }, notices, actor] = await Promise.all([params, searchParams, getCurrentActor()]);
  const aggregate = localWorkflow.service.getProtocol(protocolId);
  if (!aggregate) notFound();
  const record = aggregate.versions.find((candidate) => candidate.contentVersion === version);
  if (!record) notFound();
  const isCurrent = aggregate.currentVersion === version;
  const audit = [...localWorkflow.service.listAudit(protocolId)].reverse();
  const latestCandidate = audit.find((event) => event.action === "package-candidate.generated");
  const completedWorkflowSteps: Readonly<Record<typeof record.state, number>> = {
    draft: 1,
    "in-clinical-review": 1,
    "clinically-reviewed": 2,
    "clinically-approved": 3,
    "technically-validated": 4,
    "release-approved": latestCandidate ? 6 : 5,
  };

  return (
    <>
      <div className="page-header detail-header">
        <div>
          <p className="eyebrow">{protocolId}</p>
          <h1>{record.content.title.en}</h1>
          <div className="header-meta"><span>Version {record.contentVersion}</span><StatusBadge state={record.state} />{!isCurrent && <span className="historical">Historical version</span>}</div>
        </div>
        <Link className="button button-secondary" href="/protocols">Back to protocols</Link>
      </div>
      <Notice message={notices.message} />
      <Notice message={notices.error} tone="error" />

      <section className="workflow-bar" aria-label="Workflow progress">
        {["Draft", "Clinical review", "Clinical approval", "Technical validation", "Release approval", "Package candidate"].map((label, index) => (
          <div key={label} className={index < completedWorkflowSteps[record.state] ? "complete" : ""}>
            <span>{index + 1}</span><small>{label}</small>
          </div>
        ))}
      </section>

      {isCurrent && (
        <section className="panel action-panel">
          <div><h2>Available action</h2><p>Signed in locally as {actor.displayName} · {roleLabels[actor.role]}</p></div>
          <div className="button-row">
            {actor.role === "content-editor" && record.state === "draft" && (
              <form action={submitReviewAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Submit for review</button></form>
            )}
            {actor.role === "clinical-reviewer" && record.state === "in-clinical-review" && (
              <>
                <form action={completeReviewAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Complete clinical review</button></form>
                <form action={requestChangesAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-secondary">Request changes</button></form>
              </>
            )}
            {actor.role === "clinical-reviewer" && record.state === "clinically-reviewed" && (
              <form action={clinicalApproveAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Clinically approve checksum</button></form>
            )}
            {actor.role === "administrator" && record.state === "clinically-approved" && (
              <form action={technicalValidateAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Run technical validation</button></form>
            )}
            {actor.role === "release-manager" && record.state === "technically-validated" && (
              <form action={releaseApproveAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Grant release approval</button></form>
            )}
            {actor.role === "release-manager" && record.state === "release-approved" && (
              <form action={generateCandidateAction}><ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} /><button className="button button-primary">Generate unsigned candidate</button></form>
            )}
            <span className="action-note">The domain service rejects unauthorized or out-of-order actions even if UI controls are bypassed.</span>
          </div>
        </section>
      )}

      <div className="content-grid">
        <section className="panel span-two">
          <div className="panel-heading"><h2>Bilingual content</h2><code>{record.contentChecksum}</code></div>
          <div className="language-grid">
            <article><span className="language-label">ENGLISH</span><h3>{record.content.title.en}</h3><p>{record.content.summary.en}</p></article>
            <article><span className="language-label">FRANÇAIS</span><h3>{record.content.title.fr}</h3><p>{record.content.summary.fr}</p></article>
          </div>
          {record.content.sections.map((section) => (
            <div className="section-row" key={section.sectionId}>
              <div><strong>{section.heading.en}</strong><span>{section.steps[0]?.text.en}</span></div>
              <div><strong>{section.heading.fr}</strong><span>{section.steps[0]?.text.fr}</span></div>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Source and provenance</h2>
          <dl className="details-list">
            <div><dt>Prepared by</dt><dd>{record.content.provenance.preparation.preparedById}</dd></div>
            <div><dt>Actor type</dt><dd>{record.content.provenance.preparation.actorType}</dd></div>
            <div><dt>Prepared</dt><dd>{formatTimestamp(record.content.provenance.preparation.preparedAt)}</dd></div>
          </dl>
          {record.content.provenance.sources.map((source) => (
            <article className="source" key={source.sourceId}><strong>{source.title}</strong><span>{source.organization}</span><span>{source.jurisdiction} · {source.language.toUpperCase()}</span><code>{source.locator}</code></article>
          ))}
        </section>

        <section className="panel">
          <h2>Approval gates</h2>
          <ol className="gate-list">
            <li className={record.clinicalReviews.some((review) => review.decision === "reviewed") ? "done" : ""}><strong>Clinical review</strong><span>{record.clinicalReviews.at(-1)?.reviewerDisplayName ?? "Pending"}</span></li>
            <li className={record.clinicalApproval ? "done" : ""}><strong>Clinical approval</strong><span>{record.clinicalApproval?.approverDisplayName ?? "Pending"}</span></li>
            <li className={record.technicalValidation ? "done" : ""}><strong>Technical validation</strong><span>{record.technicalValidation?.status ?? "Pending"}</span></li>
            <li className={record.releaseApproval ? "done" : ""}><strong>Release approval</strong><span>{record.releaseApproval?.releaseOwnerId ?? "Pending"}</span></li>
          </ol>
          <p className="safety-note">Technical validation cannot replace clinical approval. Every completed gate must match the checksum above.</p>
          {latestCandidate?.metadata?.packageChecksum && <div className="candidate-result"><strong>Latest unsigned candidate</strong><code>{latestCandidate.metadata.packageChecksum}</code><span>Not signed, published, or installed.</span></div>}
        </section>

        {actor.role === "content-editor" && isCurrent && (
          <section className="panel span-two">
            <h2>Edit content</h2>
            <p>Editing any reviewed or approved version creates a new unapproved patch version.</p>
            <form action={editDraftAction} className="form-stack">
              <ActionFields protocolId={protocolId} version={version} checksum={record.contentChecksum} />
              <div className="language-grid">
                <label>English title<input name="titleEn" defaultValue={record.content.title.en} required /></label>
                <label>French title<input name="titleFr" defaultValue={record.content.title.fr} required /></label>
                <label>English summary<textarea name="summaryEn" rows={3} defaultValue={record.content.summary.en} required /></label>
                <label>French summary<textarea name="summaryFr" rows={3} defaultValue={record.content.summary.fr} required /></label>
              </div>
              <button className="button button-secondary" type="submit">Save content</button>
            </form>
          </section>
        )}

        <section className="panel">
          <h2>Version history</h2>
          <ul className="history-list">
            {[...aggregate.versions].reverse().map((item) => (
              <li key={item.contentVersion}><Link href={`/protocols/${protocolId}/${item.contentVersion}`}>Version {item.contentVersion}</Link><span>{stateLabels[item.state]}</span><time>{formatTimestamp(item.updatedAt)}</time></li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Recent audit events</h2>
          <ul className="history-list">
            {audit.slice(0, 6).map((event) => (
              <li key={event.eventId}><strong>{event.action}</strong><span>{event.actorDisplayName}</span><time>{formatTimestamp(event.timestamp)}</time></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
