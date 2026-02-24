import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGETS = [
  "src/app/(protected)",
  "src/components/nav",
  "src/components",
];
const EXCLUDED_PREFIXES = ["src/components/ui"];

const ALLOWLIST_PATH = path.join(ROOT, "scripts", "design-lint-allowlist.json");

const rules = {
  grayTokens: /\b(?:text|bg|border|from|to|via|ring)-gray-\d{2,3}(?:\/\d{1,3})?\b/g,
  pinkTokens: /\b(?:text|bg|border|from|to|via|ring)-pink-\d{2,3}(?:\/\d{1,3})?\b/g,
  hardcodedHex: /#[0-9a-fA-F]{3,8}\b/g,
  bgWhite: /\bbg-white(?:\/\d{1,3})?\b/g,
  gradient: /linear-gradient\s*\(/g,
  rawButtonClass:
    /<button[^>]*className=\"[^\"]*(?:rounded-|shadow-|border-dashed|px-|py-|bg-)[^\"]*\"/g,
};

function isAllowed(filePath, ruleName, line) {
  if (!globalThis.allowlist?.[ruleName]?.[filePath]) return false;
  const entries = globalThis.allowlist[ruleName][filePath];
  return entries.some((pattern) => new RegExp(pattern).test(line));
}

async function readAllowlist() {
  try {
    const raw = await fs.readFile(ALLOWLIST_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function walk(dir) {
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      const rel = path.relative(ROOT, full).replace(/\\/g, "/");

      if (EXCLUDED_PREFIXES.some((prefix) => rel.startsWith(prefix))) {
        return [];
      }

      if (entry.isDirectory()) return walk(full);
      if (!entry.name.endsWith(".tsx")) return [];
      return [rel];
    })
  );

  return files.flat();
}

function findLineNumber(source, index) {
  return source.slice(0, index).split("\n").length;
}

function shouldAllowGradient(filePath) {
  return /cat|special|challenge|milestone/i.test(filePath);
}

function shouldSkipRawButtonMatch(line) {
  return line.includes("interactive-icon") || line.includes("<Button") || line.includes("<IconButton");
}

async function main() {
  globalThis.allowlist = await readAllowlist();

  const fileSets = await Promise.all(
    TARGETS.map((target) => walk(path.join(ROOT, target)))
  );
  const files = [...new Set(fileSets.flat())].sort();

  const failures = [];

  for (const relPath of files) {
    const absolute = path.join(ROOT, relPath);
    const source = await fs.readFile(absolute, "utf8");

    for (const [ruleName, regex] of Object.entries(rules)) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(source)) !== null) {
        const lineNumber = findLineNumber(source, match.index);
        const line = source.split("\n")[lineNumber - 1]?.trim() ?? "";

        if (ruleName === "gradient" && shouldAllowGradient(relPath)) continue;
        if (ruleName === "rawButtonClass" && shouldSkipRawButtonMatch(line)) continue;
        if (isAllowed(relPath, ruleName, line)) continue;

        failures.push({ ruleName, relPath, lineNumber, line });
      }
    }
  }

  if (failures.length > 0) {
    console.error("Design system lint failed:\n");
    for (const failure of failures) {
      console.error(
        `${failure.relPath}:${failure.lineNumber} [${failure.ruleName}] ${failure.line}`
      );
    }
    process.exit(1);
  }

  console.log("Design system lint passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
