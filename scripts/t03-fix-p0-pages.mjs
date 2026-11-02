import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const edits = [
  {
    file: "src/mirrored-pages/blog/automotive-machining/index.html",
    replacements: [
      [
        '<meta name="generator" content="Site Kit by Google 1.187.0" /><meta name="description" content="Explore precision CNC machining for automotive applications, crafting lightweight, durable parts from aluminum, steel, and titanium for engines, transmissions, and chassis.">',
        '<meta name="generator" content="Site Kit by Google 1.187.0" />',
      ],
    ],
  },
  {
    file: "src/mirrored-pages/custom-cnc-parts/5-axis-cnc-machining-brass-parts/index.html",
    replacements: [
      ["/wp-content/uploads/2026/09/electricals.jpg", "/wp-content/uploads/2026/04/brass-electrical-connector-terminals.jpg"],
      ["/wp-content/uploads/2026/09/fluid-control.jpg", "/wp-content/uploads/2026/04/fluid-control.jpg"],
      ["/wp-content/uploads/2026/09/industrial-machinery.jpg", "/wp-content/uploads/2026/05/industrial-machinery.jpg"],
    ],
  },
  {
    file: "src/mirrored-pages/custom-cnc-parts/reducer-shaft/index.html",
    replacements: [
      ["/wp-content/uploads/2026/06/construction-agricultural-reducer.jpg", "/wp-content/uploads/2026/05/construction-mining-gearbox-housing.jpg"],
    ],
  },
  {
    file: "src/mirrored-pages/custom-cnc-parts/robotic-machining-cells/index.html",
    replacements: [
      ["/wp-content/uploads/2026/06/robot-cell-chip-coolant-peripheral-hardware.jpg", "/wp-content/uploads/2026/06/robot-cell-measurement-air-gauge-vision-cmm.jpg"],
    ],
  },
];

let changedFiles = 0;
const changes = [];

for (const edit of edits) {
  const filePath = path.join(projectRoot, edit.file);
  let html = await readFile(filePath, "utf8");
  const original = html;
  for (const [from, to] of edit.replacements) {
    const count = html.split(from).length - 1;
    if (count === 0) {
      throw new Error(`Replacement target not found in ${edit.file}: ${from}`);
    }
    html = html.replaceAll(from, to);
    changes.push({ file: edit.file, from, to, count });
  }
  if (html !== original) {
    await writeFile(filePath, html, "utf8");
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, changes }, null, 2));
