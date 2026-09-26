import type { Locale } from "@rapidaid/protocol-engine/authoring";

import cardiacEn from "./odersa/source/en/l-arret-cardiaque.json";
import strokeEn from "./odersa/source/en/l-avc-en-60-secondes.json";
import chokingEn from "./odersa/source/en/l-etouffement-d-un-adulte.json";
import bleedingEn from "./odersa/source/en/l-hemorragie-grave-et-le-garrot.json";
import burnEn from "./odersa/source/en/la-brulure-de-cuisine.json";
import seizureEn from "./odersa/source/en/la-crise-convulsive.json";
import cardiacFr from "./odersa/source/fr/l-arret-cardiaque.json";
import strokeFr from "./odersa/source/fr/l-avc-en-60-secondes.json";
import chokingFr from "./odersa/source/fr/l-etouffement-d-un-adulte.json";
import bleedingFr from "./odersa/source/fr/l-hemorragie-grave-et-le-garrot.json";
import burnFr from "./odersa/source/fr/la-brulure-de-cuisine.json";
import seizureFr from "./odersa/source/fr/la-crise-convulsive.json";
import type { EditableProtocolContent } from "./types";

export const ODERSA_ATTRIBUTION = "Avant les secours, ODERSA, avantlessecours.odersa.org, CC BY 4.0";
export const ODERSA_LICENSE_URL = "https://avantlessecours.odersa.org/licence";
export const ODERSA_MVP_CONTENT_VERSION = "1.0.0";

type OdersaRule = { cle: string; titre: string; texte: string; source: string };
type OdersaReference = { cle: string; titre: string; editeur: string; url: string };
type OdersaCase = {
  _licence: string;
  _source: string;
  genere_le: string;
  id: string;
  titre: string;
  fiche_recap: { titre: string; chapeau: string; regles: OdersaRule[] };
  source_officielle: { verifie_le: string; sources: OdersaReference[] };
};

type SourcePair = { en: OdersaCase; fr: OdersaCase };

export type OdersaImportedDraft = Readonly<{
  protocolId: string;
  sourceRecordId: string;
  originalTitle: Readonly<{ en: string; fr: string }>;
  translationStatus: "official-odersa-bilingual";
  adaptationStatus: "adapted-for-rapidaid-cameroon-review";
  attribution: typeof ODERSA_ATTRIBUTION;
  contentVersion: typeof ODERSA_MVP_CONTENT_VERSION;
  emergencyServiceId?: "service.cm.samu.119";
  content: EditableProtocolContent;
}>;

function asCase(input: unknown, expectedId: string): OdersaCase {
  const value = input as Partial<OdersaCase>;
  if (value.id !== expectedId || !value._source || !value._licence?.includes("CC BY 4.0")
    || !value.fiche_recap?.regles?.length || !value.source_officielle?.sources?.length
    || !value.source_officielle.verifie_le || !value.genere_le || !value.titre) {
    throw new Error(`Invalid ODERSA source snapshot for ${expectedId}.`);
  }
  return value as OdersaCase;
}

const selectedSources: readonly SourcePair[] = [
  { en: asCase(cardiacEn, "l-arret-cardiaque"), fr: asCase(cardiacFr, "l-arret-cardiaque") },
  { en: asCase(chokingEn, "l-etouffement-d-un-adulte"), fr: asCase(chokingFr, "l-etouffement-d-un-adulte") },
  { en: asCase(bleedingEn, "l-hemorragie-grave-et-le-garrot"), fr: asCase(bleedingFr, "l-hemorragie-grave-et-le-garrot") },
  { en: asCase(burnEn, "la-brulure-de-cuisine"), fr: asCase(burnFr, "la-brulure-de-cuisine") },
  { en: asCase(strokeEn, "l-avc-en-60-secondes"), fr: asCase(strokeFr, "l-avc-en-60-secondes") },
  { en: asCase(seizureEn, "la-crise-convulsive"), fr: asCase(seizureFr, "la-crise-convulsive") },
];

const emergencyReferenceRules = new Set([
  "l-arret-cardiaque:3",
  "l-avc-en-60-secondes:3",
  "l-avc-en-60-secondes:7",
  "la-brulure-de-cuisine:5",
]);

const samuAdaptedRecords = new Set([
  "l-arret-cardiaque",
  "l-avc-en-60-secondes",
  "la-brulure-de-cuisine",
]);

function adaptEmergencyContact(recordId: string, rule: OdersaRule, locale: Locale): OdersaRule {
  if (!emergencyReferenceRules.has(`${recordId}:${rule.cle}`)) return rule;
  const replacements = locale === "fr"
    ? [[/le 15 ou le 18/g, "le SAMU 119"], [/le 15 ou le 112/g, "le SAMU 119"], [/au 15/g, "au SAMU 119"], [/appelle le 15/g, "appelle le SAMU 119"]] as const
    : [[/15 or 18/g, "SAMU 119"], [/15 or 112/g, "SAMU 119"], [/tell 15/g, "tell SAMU 119"], [/call 15/g, "call SAMU 119"]] as const;
  return {
    ...rule,
    titre: replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), rule.titre),
    texte: replacements.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), rule.texte),
  };
}

function isoDate(date: string): string {
  return `${date}T00:00:00.000Z`;
}

function sourceReferences(pair: SourcePair) {
  const odersaSources = (["en", "fr"] as const).map((locale) => {
    const source = pair[locale];
    return {
      sourceId: `source.odersa.${source.id}.${locale}`,
      sourceRecordId: source.id,
      title: source.titre,
      organization: "ODERSA",
      locator: source._source,
      language: locale,
      jurisdiction: "France",
      verifiedAt: isoDate(source.source_officielle.verifie_le),
      accessedAt: "2026-09-26T00:00:00.000Z",
      sourceVersion: source.genere_le,
      license: { identifier: "CC-BY-4.0", locator: ODERSA_LICENSE_URL, attribution: ODERSA_ATTRIBUTION },
      adaptation: {
        status: "adapted" as const,
        description: {
          en: "ODERSA content was selected and structured for RapidAid. Where the source recap named French emergency contacts, only those phrases were adapted to the separately verified Cameroon SAMU 119 integration; no additional medical steps were added.",
          fr: "Le contenu ODERSA a été sélectionné et structuré pour RapidAid. Lorsque la fiche source citait des contacts d’urgence français, seules ces mentions ont été adaptées à l’intégration camerounaise SAMU 119 vérifiée séparément ; aucune étape médicale supplémentaire n’a été ajoutée.",
        },
        endorsementDisclaimer: {
          en: "ODERSA does not endorse RapidAid or this adaptation.",
          fr: "ODERSA ne cautionne ni RapidAid ni cette adaptation.",
        },
      },
    };
  });
  const publicReferences = pair.fr.source_officielle.sources.map((reference) => ({
    sourceId: `source.odersa.reference.${reference.cle}`,
    sourceRecordId: reference.cle,
    title: reference.titre,
    organization: reference.editeur,
    locator: reference.url,
    language: "fr" as const,
    jurisdiction: "France",
    verifiedAt: isoDate(pair.fr.source_officielle.verifie_le),
    accessedAt: "2026-09-26T00:00:00.000Z",
    sourceVersion: pair.fr.genere_le,
  }));
  return [...odersaSources, ...publicReferences];
}

function importPair(pair: SourcePair): OdersaImportedDraft {
  if (pair.en.id !== pair.fr.id) throw new Error("ODERSA bilingual source IDs do not match.");
  if (pair.en.fiche_recap.regles.length !== pair.fr.fiche_recap.regles.length) {
    throw new Error(`ODERSA bilingual source is incomplete for ${pair.fr.id}.`);
  }
  const frRules = new Map(pair.fr.fiche_recap.regles.map((rule) => [rule.cle, adaptEmergencyContact(pair.fr.id, rule, "fr")]));
  const steps = pair.en.fiche_recap.regles.map((rule, index) => {
    const enRule = adaptEmergencyContact(pair.en.id, rule, "en");
    const frRule = frRules.get(enRule.cle);
    if (!frRule) throw new Error(`Missing French ODERSA rule ${pair.fr.id}:${enRule.cle}.`);
    return {
      stepId: `step.odersa.${pair.fr.id}.${enRule.cle}`,
      sequence: index + 1,
      kind: "instruction" as const,
      text: { en: `${enRule.titre}. ${enRule.texte}`, fr: `${frRule.titre}. ${frRule.texte}` },
    };
  });
  const protocolId = `protocol.odersa.${pair.fr.id}`;
  const content: EditableProtocolContent = {
    schemaVersion: "1.0.0",
    title: { en: pair.en.fiche_recap.titre, fr: pair.fr.fiche_recap.titre },
    summary: { en: pair.en.fiche_recap.chapeau, fr: pair.fr.fiche_recap.chapeau },
    effectiveAt: "2026-09-26T00:00:00.000Z",
    reviewDueAt: "2027-09-26T00:00:00.000Z",
    provenance: {
      preparation: { preparedById: "agent.odersa.import", actorType: "ai-assistant", preparedAt: "2026-09-26T00:00:00.000Z" },
      sources: sourceReferences(pair),
    },
    sections: [{
      sectionId: `section.odersa.${pair.fr.id}.recap`,
      sequence: 1,
      heading: { en: pair.en.titre, fr: pair.fr.titre },
      steps,
    }],
  };
  return {
    protocolId,
    sourceRecordId: pair.fr.id,
    originalTitle: { en: pair.en.titre, fr: pair.fr.titre },
    translationStatus: "official-odersa-bilingual",
    adaptationStatus: "adapted-for-rapidaid-cameroon-review",
    attribution: ODERSA_ATTRIBUTION,
    contentVersion: ODERSA_MVP_CONTENT_VERSION,
    ...(samuAdaptedRecords.has(pair.fr.id) ? { emergencyServiceId: "service.cm.samu.119" as const } : {}),
    content,
  };
}

export const ODERSA_MVP_DRAFTS: readonly OdersaImportedDraft[] = selectedSources.map(importPair);
