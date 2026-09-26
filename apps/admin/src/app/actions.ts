"use server";

import type { EditableProtocolContent } from "@rapidaid/content-workflow";
import { WorkflowError } from "@rapidaid/content-workflow";
import { makeSyntheticDraftContent } from "@rapidaid/content-workflow/testing";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentActor, getLocalHumanActor } from "@/lib/localAuth";
import { localWorkflow } from "@/lib/workflow";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function detailPath(protocolId: string, version: string, key: "message" | "error", message: string): string {
  const query = new URLSearchParams({ [key]: message });
  return `/protocols/${protocolId}/${version}?${query}`;
}

async function runDetailAction(
  formData: FormData,
  operation: (protocolId: string, version: string) => void,
  successMessage: string,
): Promise<never> {
  const protocolId = field(formData, "protocolId");
  const version = field(formData, "contentVersion");
  let destination: string;
  try {
    operation(protocolId, version);
    const aggregate = localWorkflow.service.getProtocol(protocolId);
    destination = detailPath(protocolId, aggregate?.currentVersion ?? version, "message", successMessage);
  } catch (error) {
    const message = error instanceof WorkflowError ? error.message : "The local workflow action failed.";
    destination = detailPath(protocolId, version, "error", message);
  }
  revalidatePath("/");
  redirect(destination);
}

export async function setLocalActorAction(formData: FormData): Promise<never> {
  const actor = getLocalHumanActor(field(formData, "actorId"));
  if (!actor) redirect("/protocols?error=Unknown+local+actor");
  const cookieStore = await cookies();
  cookieStore.set("rapidaid-admin-actor", actor.actorId, { httpOnly: true, sameSite: "strict", path: "/" });
  redirect("/protocols");
}

export async function createDraftAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  const protocolId = field(formData, "protocolId");
  const content = makeSyntheticDraftContent();
  content.title = { en: field(formData, "titleEn"), fr: field(formData, "titleFr") };
  content.summary = { en: field(formData, "summaryEn"), fr: field(formData, "summaryFr") };
  content.provenance.preparation = {
    preparedById: actor.actorId,
    actorType: "human",
    preparedAt: new Date().toISOString(),
  };

  let destination: string;
  try {
    const aggregate = localWorkflow.service.createDraft(actor, protocolId, content);
    destination = detailPath(protocolId, aggregate.currentVersion, "message", "Synthetic draft created.");
  } catch (error) {
    const message = error instanceof WorkflowError ? error.message : "Draft creation failed.";
    destination = `/protocols/new?${new URLSearchParams({ error: message })}`;
  }
  revalidatePath("/protocols");
  redirect(destination);
}

export async function editDraftAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    const aggregate = localWorkflow.service.getProtocol(protocolId);
    const current = aggregate?.versions.find((item) => item.contentVersion === version);
    if (!current) throw new WorkflowError("not-found", "Protocol version was not found.");
    const content: EditableProtocolContent = structuredClone(current.content);
    content.title = { en: field(formData, "titleEn"), fr: field(formData, "titleFr") };
    content.summary = { en: field(formData, "summaryEn"), fr: field(formData, "summaryFr") };
    localWorkflow.service.editContent(actor, protocolId, version, content);
  }, "Draft content saved; prior approvals were not carried forward.");
}

export async function submitReviewAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.submitForClinicalReview(actor, protocolId, version);
  }, "Submitted to the clinical-review queue.");
}

export async function completeReviewAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.recordClinicalReview(actor, protocolId, version, "reviewed");
  }, "Clinical review recorded for this exact checksum.");
}

export async function requestChangesAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.recordClinicalReview(actor, protocolId, version, "changes-requested");
  }, "Changes requested; the version returned to draft.");
}

export async function clinicalApproveAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.grantClinicalApproval(actor, protocolId, version, field(formData, "contentChecksum"));
  }, "Human clinical approval recorded.");
}

export async function technicalValidateAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.runTechnicalValidation(actor, protocolId, version);
  }, "Technical validation passed; clinical approval remains independently required.");
}

export async function releaseApproveAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.grantReleaseApproval(actor, protocolId, version, field(formData, "contentChecksum"));
  }, "Human release approval recorded.");
}

export async function generateCandidateAction(formData: FormData): Promise<never> {
  const actor = await getCurrentActor();
  return runDetailAction(formData, (protocolId, version) => {
    localWorkflow.service.generateUnsignedPackageCandidate(actor, protocolId, version);
  }, "Unsigned package candidate generated. Nothing was signed, published, or installed.");
}
