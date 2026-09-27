import { readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDirectory = fileURLToPath(new URL("../dist/", import.meta.url));
const forbiddenDraftMarkers = [
  "protocol.odersa.",
  "odersa-mvp-1.0.0",
  "Two questions, ten seconds",
  "Ne jamais contraindre les mouvements",
  "animation.odersa.choking.back-blows.v1",
  "animation.odersa.choking.abdominal-thrusts.v1",
  "animation.odersa.choking.unresponsive-cpr.v1",
  "choking-back-blows-v1",
  "choking-abdominal-thrusts-v1",
  "choking-unresponsive-cpr-v1",
];

function filesWithin(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesWithin(path) : [path];
  });
}

const bundles = filesWithin(outputDirectory).filter((path) => [".hbc", ".js"].includes(extname(path)));
if (bundles.length === 0) throw new Error("No Android JavaScript or Hermes bundle was found.");

for (const bundle of bundles) {
  const content = readFileSync(bundle, "latin1");
  for (const marker of forbiddenDraftMarkers) {
    if (content.includes(marker)) {
      throw new Error(`Development protocol marker was found in release bundle: ${marker}`);
    }
  }
}

console.log("Release preview boundary valid: ODERSA draft procedures are absent from the production bundle.");
