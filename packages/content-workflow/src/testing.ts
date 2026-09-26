import type { AuthenticatedActor, EditableProtocolContent } from "./types";

export const syntheticActors = {
  editor: {
    actorId: "editor.synthetic.alpha",
    displayName: "Synthetic Content Editor",
    kind: "human",
    role: "content-editor",
    authenticated: true,
  },
  reviewer: {
    actorId: "reviewer.synthetic.alpha",
    displayName: "Synthetic Clinical Reviewer",
    kind: "human",
    role: "clinical-reviewer",
    authenticated: true,
    credentialReference: "SYNTHETIC-CREDENTIAL-NOT-REAL",
  },
  releaseManager: {
    actorId: "release.synthetic.alpha",
    displayName: "Synthetic Release Manager",
    kind: "human",
    role: "release-manager",
    authenticated: true,
  },
  administrator: {
    actorId: "administrator.synthetic.alpha",
    displayName: "Synthetic Administrator",
    kind: "human",
    role: "administrator",
    authenticated: true,
  },
  aiReviewer: {
    actorId: "agent.synthetic.alpha",
    displayName: "Synthetic AI Agent",
    kind: "ai-agent",
    role: "clinical-reviewer",
    authenticated: true,
  },
  serviceReleaseManager: {
    actorId: "service.synthetic.alpha",
    displayName: "Synthetic Service Actor",
    kind: "service",
    role: "release-manager",
    authenticated: true,
  },
} as const satisfies Record<string, AuthenticatedActor>;

export function makeSyntheticDraftContent(): EditableProtocolContent {
  return {
    schemaVersion: "1.0.0",
    title: {
      en: "Synthetic workflow protocol — not medical guidance",
      fr: "Protocole synthétique de flux — aucun conseil médical",
    },
    summary: {
      en: "Administrative workflow fixture only. Do not take action.",
      fr: "Exemple de flux administratif uniquement. Ne pas agir.",
    },
    effectiveAt: "2026-01-01T00:00:00.000Z",
    reviewDueAt: "2098-01-01T00:00:00.000Z",
    expiresAt: "2099-01-01T00:00:00.000Z",
    provenance: {
      preparation: {
        preparedById: "editor.synthetic.alpha",
        actorType: "human",
        preparedAt: "2026-01-01T00:00:00.000Z",
      },
      sources: [{
        sourceId: "source.synthetic.workflow.alpha",
        title: "Synthetic Workflow Source — Not Authoritative",
        organization: "Example Invalid Organization",
        locator: "https://example.invalid/rapidaid-admin-synthetic",
        language: "en",
        jurisdiction: "synthetic-test-only",
        publishedAt: "2026-01-01T00:00:00.000Z",
        accessedAt: "2026-01-01T00:00:00.000Z",
        sourceVersion: "synthetic-1",
      }],
    },
    sections: [{
      sectionId: "section.synthetic.workflow.alpha",
      sequence: 1,
      heading: {
        en: "Synthetic content section",
        fr: "Section de contenu synthétique",
      },
      steps: [{
        stepId: "step.synthetic.workflow.alpha",
        sequence: 1,
        kind: "information",
        text: {
          en: "SYNTHETIC CONTENT SLOT — DO NOT TAKE ACTION.",
          fr: "EMPLACEMENT DE CONTENU SYNTHÉTIQUE — NE PAS AGIR.",
        },
      }],
    }],
  };
}
