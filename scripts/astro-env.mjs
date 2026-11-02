import { spawn } from "node:child_process";
import { join } from "node:path";

const command = process.argv[2] || "dev";
const astroBin = join("node_modules", "astro", "bin", "astro.mjs");

const child = spawn(process.execPath, [astroBin, command, ...process.argv.slice(3)], {
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
