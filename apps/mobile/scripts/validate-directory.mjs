import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { validateProductionDirectoryDocument } from "../src/directory/validation.ts";

const defaultPath = path.join("content", "directory", "production-directory.json");
const inputPath = path.resolve(process.cwd(), process.argv[2] ?? defaultPath);

let document;
try {
  document = JSON.parse(await readFile(inputPath, "utf8"));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Directory import failed: ${message}`);
  process.exitCode = 1;
}

if (document !== undefined) {
  const result = validateProductionDirectoryDocument(document);
  if (!result.ok) {
    console.error(`Directory import rejected (${inputPath}):`);
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Directory valid: ${result.snapshot.emergencyServices.length} official emergency service(s); `
      + `dataset ${result.snapshot.datasetVersion}.`,
    );
  }
}
