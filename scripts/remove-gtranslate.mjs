import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requestedTargets = process.argv.slice(2);
const targets =
  requestedTargets.length > 0
    ? requestedTargets
    : ["src/mirrored-pages"];

const patterns = [
  {
    name: "wrapper",
    regex:
      /<div\b(?=[^>]*\bgtranslate_wrapper\b)(?=[^>]*\bgt-wrapper-\d+\b)[^>]*>\s*<\/div>/gi,
  },
  {
    name: "settings",
    regex:
      /<script\b[^>]*\bid=["']gt_widget_script_\d+-js-before["'][^>]*>\s*window\.gtranslateSettings[\s\S]*?<\/script>/gi,
  },
  {
    name: "dropdown",
    regex:
      /<script\b(?=[^>]*\bsrc=["'][^"']*\/wp-content\/plugins\/gtranslate\/js\/dropdown\.js[^"']*["'])[^>]*>\s*<\/script>/gi,
  },
];

const totals = {
  filesChecked: 0,
  filesChanged: 0,
  replacements: Object.fromEntries(patterns.map((pattern) => [pattern.name, 0])),
};

function resolveTarget(target) {
  return path.resolve(projectRoot, target);
}

async function collectHtmlFiles(target) {
  const files = [];

  async function walk(current) {
    let currentStat;
    try {
      currentStat = await stat(current);
    } catch {
      return;
    }

    if (currentStat.isFile()) {
      if (current.endsWith(".html")) files.push(current);
      return;
    }

    if (!currentStat.isDirectory()) return;

    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      await walk(path.join(current, entry.name));
    }
  }

  await walk(target);
  return files;
}

function replaceWithCount(input, regex, replacement) {
  let count = 0;
  const output = input.replace(regex, () => {
    count += 1;
    return replacement;
  });
  return { output, count };
}

async function cleanFile(file) {
  totals.filesChecked += 1;

  let html = await readFile(file, "utf8");
  const original = html;

  for (const pattern of patterns) {
    const result = replaceWithCount(html, pattern.regex, "");
    html = result.output;
    totals.replacements[pattern.name] += result.count;
  }

  if (html !== original) {
    await writeFile(file, html, "utf8");
    totals.filesChanged += 1;
  }
}

for (const target of targets) {
  const htmlFiles = await collectHtmlFiles(resolveTarget(target));
  for (const file of htmlFiles) {
    await cleanFile(file);
  }
}

console.log(JSON.stringify(totals, null, 2));
