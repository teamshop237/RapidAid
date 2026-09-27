import type { PresentationStepVisual } from "@/protocols/presentation";

export type DevelopmentAnimationSource = Readonly<{
  organization: string;
  title: string;
  url: string;
  publicationOrUpdateDate?: string;
  supports: readonly string[];
}>;

export type DevelopmentAnimationStoryboard = Readonly<{
  startingBodyPositions: string;
  helperPosition: string;
  patientPosition: string;
  contactLocation: string;
  movementDirection: string;
  sequence: readonly string[];
  repetitions: string;
  doNotImply: readonly string[];
}>;

export type DevelopmentStepAnimation = PresentationStepVisual & Readonly<{
  protocolId: "protocol.odersa.l-etouffement-d-un-adulte";
  stepId: string;
  sourceCheckedAt: "2026-09-27";
  sources: readonly DevelopmentAnimationSource[];
  storyboard: DevelopmentAnimationStoryboard;
  notes: string;
}>;

const protocolId = "protocol.odersa.l-etouffement-d-un-adulte" as const;
const sourceCheckedAt = "2026-09-27" as const;

const odersaSource: DevelopmentAnimationSource = Object.freeze({
  organization: "ODERSA",
  title: "Avant les secours — An adult choking / L'étouffement d'un adulte",
  url: "https://avantlessecours.odersa.org/en/cas/l-etouffement-d-un-adulte",
  publicationOrUpdateDate: "2026-09-14",
  supports: Object.freeze([
    "Existing RapidAid step order and wording",
    "Back blows, abdominal thrusts, alternation, and loss-of-consciousness sequence",
  ]),
});

const frenchCivilSecuritySource: DevelopmentAnimationSource = Object.freeze({
  organization: "French Ministry of the Interior — Civil Security",
  title: "Références techniques nationales — Premiers Secours Citoyen",
  url: "https://www.securite-civile.interieur.gouv.fr/sites/securitecivile/files/medias/documents/2026-07/References-techniques-nationales-PSC_juillet-2026.pdf",
  publicationOrUpdateDate: "2026-07",
  supports: Object.freeze([
    "Adult back-blow body position, support hand, contact area, and open-hand heel",
    "Adult abdominal-thrust body position, hand placement, inward/upward direction, release, and count",
    "Lowering an unresponsive person and beginning CPR with adult chest-compression positioning",
  ]),
});

const frenchRedCrossSource: DevelopmentAnimationSource = Object.freeze({
  organization: "Croix-Rouge française",
  title: "L'étouffement",
  url: "https://www.croix-rouge.fr/les-gestes-de-premiers-secours/etouffement",
  supports: Object.freeze([
    "Back-blow and abdominal-thrust technique and checking after each blow",
    "Alternating up to five back blows and five abdominal thrusts",
    "Gentle lowering, emergency alert, and starting with thirty chest compressions",
  ]),
});

const ahaSource: DevelopmentAnimationSource = Object.freeze({
  organization: "American Heart Association",
  title: "2025 Guidelines for CPR and ECC — Part 7: Adult Basic Life Support",
  url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-basic-life-support",
  publicationOrUpdateDate: "2025-10-22",
  supports: Object.freeze([
    "Cycles of five back blows followed by five abdominal thrusts for severe adult FBAO",
    "Starting CPR with chest compressions when the adult becomes unresponsive",
    "Supine patient, rescuer beside chest, overlapped hands at center/lower sternum, vertical compression",
  ]),
});

const rcukSource: DevelopmentAnimationSource = Object.freeze({
  organization: "Resuscitation Council UK",
  title: "Adult basic life support Guidelines 2025",
  url: "https://www.resus.org.uk/print/pdf/node/11316",
  publicationOrUpdateDate: "2025-10-27",
  supports: Object.freeze([
    "Forward lean and back blows between shoulder blades with heel of one hand",
    "Arms around upper abdomen, fist between navel and ribcage, sharp inward/upward pull",
    "Alternating up to five back blows and abdominal thrusts and starting CPR if unresponsive",
  ]),
});

const sharedSources = Object.freeze([
  odersaSource,
  frenchCivilSecuritySource,
  frenchRedCrossSource,
  ahaSource,
  rcukSource,
]);

export const developmentAnimationGuidanceNotes = Object.freeze([
  Object.freeze({
    topic: "cycle-count",
    summary: "AHA 2025 describes repeated cycles of five. French Civil Security 2026, French Red Cross, RCUK, and ODERSA describe one-to-five or up-to-five and checking/stopping when effective. The visual therefore labels 1–5 and shows a check phase rather than implying five actions must always be completed.",
  }),
  Object.freeze({
    topic: "emergency-activation-timing",
    summary: "AHA and RCUK emphasize early emergency-system activation. The existing ODERSA-derived RapidAid choking step sequence is unchanged in this animation milestone; whether the guide itself should expose SAMU 119 requires content-workflow review rather than a presentation-only change.",
  }),
]);

const developmentStepVisuals: Readonly<Record<string, DevelopmentStepAnimation>> = Object.freeze({
  "step.odersa.l-etouffement-d-un-adulte.3": Object.freeze({
    type: "procedural-animation",
    animationId: "animation.odersa.choking.back-blows.v1",
    asset: "choking-back-blows-v1",
    loop: true,
    accessibilityLabel: Object.freeze({
      en: "Development animation: the patient leans forward. The helper stands at the side and slightly behind, supports the chest with one hand, and moves the heel of an open hand to the back between the shoulder blades. The visual shows one to five separate blows and a check after each.",
      fr: "Animation de développement : la victime est penchée vers l'avant. Le sauveteur se tient sur le côté, légèrement en arrière, soutient le thorax d'une main et dirige le talon de l'autre main ouverte entre les omoplates. Le visuel montre une à cinq claques séparées et une vérification après chacune.",
    }),
    developmentStatus: "development-preview",
    clinicalReviewStatus: "not-reviewed",
    protocolId,
    stepId: "step.odersa.l-etouffement-d-un-adulte.3",
    sourceCheckedAt,
    sources: sharedSources,
    storyboard: Object.freeze({
      startingBodyPositions: "Patient standing and leaning forward; helper stable at the patient's side and slightly behind.",
      helperPosition: "One hand supports the front of the patient's chest; the other hand is open and prepared behind the upper back.",
      patientPosition: "Conscious, standing, torso clearly inclined forward.",
      contactLocation: "Heel of the open hand to the back between the shoulder blades.",
      movementDirection: "A distinct blow toward the highlighted upper-back contact area, followed by withdrawal to check effectiveness.",
      sequence: Object.freeze(["Lean and support", "Separate back blow", "Check before repeating"]),
      repetitions: "One to five, stopping if effective; the development visual demonstrates the repeat/check cycle without asserting that all five must be completed.",
      doNotImply: Object.freeze(["Do not strike the neck or lower back", "Do not omit chest support or forward lean", "Do not continue without checking after each blow"]),
    }),
    notes: "Movement geometry requires clinical visual review before release; no force magnitude is encoded.",
  }),
  "step.odersa.l-etouffement-d-un-adulte.4": Object.freeze({
    type: "procedural-animation",
    animationId: "animation.odersa.choking.abdominal-thrusts.v1",
    asset: "choking-abdominal-thrusts-v1",
    loop: true,
    accessibilityLabel: Object.freeze({
      en: "Development animation: the patient leans forward while the helper stands behind with arms around the upper abdomen. A closed fist is placed just above the navel, the other hand covers it, and the hands move inward and upward. The visual marks one to five thrusts before returning to back blows if needed.",
      fr: "Animation de développement : la victime est penchée vers l'avant tandis que le sauveteur se tient derrière, les bras autour de la partie supérieure de l'abdomen. Un poing fermé est placé juste au-dessus du nombril, l'autre main le recouvre, puis les mains tirent vers l'arrière et vers le haut. Le visuel indique une à cinq compressions avant de reprendre les claques si nécessaire.",
    }),
    developmentStatus: "development-preview",
    clinicalReviewStatus: "not-reviewed",
    protocolId,
    stepId: "step.odersa.l-etouffement-d-un-adulte.4",
    sourceCheckedAt,
    sources: sharedSources,
    storyboard: Object.freeze({
      startingBodyPositions: "Patient standing and leaning forward; helper directly behind and close to the patient's back.",
      helperPosition: "Arms pass under the patient's arms and around the upper abdomen.",
      patientPosition: "Conscious, standing, torso inclined forward.",
      contactLocation: "Closed fist just above the navel and below the lower sternum; other hand over the fist; forearms clear of the ribs.",
      movementDirection: "Hands pull sharply inward/backward and upward, then release between thrusts.",
      sequence: Object.freeze(["Position behind and encircle", "Place fist and cover", "Pull inward and upward", "Release and assess", "Return to back blows if unresolved"]),
      repetitions: "One to five abdominal thrusts after ineffective back blows; alternate with back blows if unresolved.",
      doNotImply: Object.freeze(["Do not place hands on ribs or the lower tip of the sternum", "Do not show abdominal thrusts before ineffective back blows", "Do not imply this technique applies when the abdomen cannot be encircled or in late pregnancy"]),
    }),
    notes: "Contact-point scale and motion amplitude require clinical visual review before release; the animation does not encode force.",
  }),
  "step.odersa.l-etouffement-d-un-adulte.7": Object.freeze({
    type: "procedural-animation",
    animationId: "animation.odersa.choking.unresponsive-cpr.v1",
    asset: "choking-unresponsive-cpr-v1",
    loop: true,
    accessibilityLabel: Object.freeze({
      en: "Development animation in three phases: the helper lowers the unresponsive patient gently to the floor, calls for help, then kneels beside the patient lying on the back and presses vertically with overlapped hands at the center of the chest. The phase label specifies thirty chest compressions.",
      fr: "Animation de développement en trois phases : le sauveteur accompagne doucement la victime inconsciente au sol, alerte les secours, puis s'agenouille à côté de la victime allongée sur le dos et comprime verticalement le centre de la poitrine avec les mains superposées. La phase indique trente compressions thoraciques.",
    }),
    developmentStatus: "development-preview",
    clinicalReviewStatus: "not-reviewed",
    protocolId,
    stepId: "step.odersa.l-etouffement-d-un-adulte.7",
    sourceCheckedAt,
    sources: sharedSources,
    storyboard: Object.freeze({
      startingBodyPositions: "Helper supports the unresponsive standing patient, then guides the patient to a supine position on the floor.",
      helperPosition: "Transitions from supporting the descent to kneeling close beside the patient's chest.",
      patientPosition: "Gently lowered to the floor and shown lying flat on the back.",
      contactLocation: "Overlapped hands at the center of the chest on the lower half of the sternum.",
      movementDirection: "Vertical chest-compression motion with straight arms, allowing visible release between compressions.",
      sequence: Object.freeze(["Lower gently", "Call for help", "Begin thirty chest compressions"]),
      repetitions: "Thirty chest compressions are identified because that count is explicit in the existing ODERSA-derived step and French Red Cross source.",
      doNotImply: Object.freeze(["Do not keep an unresponsive person upright", "Do not show a recovery position for this obstructed-airway sequence", "Do not show blind finger sweeps", "Do not imply that the call connected or help was dispatched"]),
    }),
    notes: "The visual intentionally stops short of depicting breaths or mouth inspection because the existing RapidAid step does not include those actions; complete CPR sequencing requires content and clinical review.",
  }),
});

export const developmentStepAnimations = Object.freeze(Object.values(developmentStepVisuals));

export function getDevelopmentStepVisual(stepId: string): DevelopmentStepAnimation | undefined {
  return developmentStepVisuals[stepId];
}
