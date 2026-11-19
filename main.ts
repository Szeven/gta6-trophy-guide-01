// Platinum Road — the program that hands the guide in (Node 22, standard
// library only). The guide itself is app/: static files a browser opens at
// app/index.html, with nothing fetched over the network. This program copies
// app/ and screenshots/ from beside itself into the output directory and
// writes dossier.json there, the summary the judge reads, using the vendored
// make.fun library. The library file stays exactly as the kit shipped it:
// the scorer requires the dossier to be byte for byte what its own copy of
// the library writes.
//
// Run it locally with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Check the trophy data before handing anything in: the gate requires all
// 55 official trophies by name, each with a non-blank guide. Fail loudly
// here instead of shipping a dossier the scorer would refuse.
import { readFileSync } from 'node:fs';
const trophyData = JSON.parse(readFileSync(join(repoRoot, 'app', 'data', 'trophies.json'), 'utf8'));
const trophyList = trophyData.trophies;
if (!Array.isArray(trophyList) || trophyList.length !== 55) {
  throw new Error(`trophies.json must hold 55 trophies, found ${trophyList?.length ?? 0}`);
}
const blankGuides = trophyList.filter((t) => !t.name || !t.guide?.trim());
if (blankGuides.length > 0) {
  throw new Error(`${blankGuides.length} trophies lack a name or a guide`);
}
const names = new Set(trophyList.map((t) => t.name));
if (names.size !== 55) throw new Error('trophy names must be unique');

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

mkdirSync(outputDir, { recursive: true });

// The guide itself, whole: pages, styles, scripts and data.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The screenshots, if they are there yet.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps, from the kit's gate: the dossier's text, the
// screenshots, and the size of app/ itself. buildDossier refuses an entry
// that breaks any of them, so a successful run is already inside the caps.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

const appFiles = countFiles(join(outputDir, 'app'));
const shotFiles = readdirSync(join(outputDir, 'screenshots')).filter((f) => !f.startsWith('.'));
console.log(
  `Platinum Road handed in: app/ (${appFiles} files) + ${shotFiles.length} screenshot(s) -> ${outputDir}`,
);
console.log(`dossier.json: ${statSync(join(outputDir, 'dossier.json')).size} bytes`);
