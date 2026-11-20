// Platinum Road — entrypoint.
// Copies app/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with the kit's dossier
// library. Node 22, standard library only, no build step.
//
// The output directory is never deleted itself: only its contents are
// cleared, so the grader's writable /output stays in place.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function clearDirectoryContents(dir: string): void {
  mkdirSync(dir, { recursive: true });
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyGuide(): void {
  for (const needed of ["app", "screenshots"]) {
    if (!existsSync(join(repoRoot, needed))) {
      throw new Error(`missing ${needed}/ in the repository`);
    }
  }
  clearDirectoryContents(outDir);
  cpSync(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
  cpSync(join(repoRoot, "screenshots"), join(outDir, "screenshots"), {
    recursive: true,
  });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
  const appFiles = readdirSync(join(outDir, "app")).length;
  const shots = readdirSync(join(outDir, "screenshots")).length;
  console.log(
    `Platinum Road handed in to ${outDir} (${appFiles} app entries, ${shots} screenshots)`
  );
}

copyGuide();
