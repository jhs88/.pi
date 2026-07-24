import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadExtensions } from "../node_modules/@earendil-works/pi-coding-agent/dist/core/extensions/loader.js";

const toolingDir = dirname(dirname(fileURLToPath(import.meta.url)));
const extensionsDir = dirname(toolingDir);
const repositoryRoot = dirname(dirname(extensionsDir));

async function productionSources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths: string[] = [];
  for (const entry of entries) {
    if (entry.name === "node_modules") continue;
    const candidate = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await productionSources(candidate));
    else if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      paths.push(candidate);
    }
  }
  return paths;
}

test("repository extensions load together without registration conflicts", async () => {
  const entries = await readdir(extensionsDir, { withFileTypes: true });
  const paths = entries.flatMap((entry) => {
    if (entry.isFile() && entry.name.endsWith(".ts")) {
      return [join(extensionsDir, entry.name)];
    }
    if (entry.isDirectory() && entry.name === "pi-tooling") {
      return [join(extensionsDir, entry.name, "index.ts")];
    }
    return [];
  });

  const result = await loadExtensions(paths, repositoryRoot);
  assert.deepEqual(result.errors, []);

  const registrations = new Map<string, string[]>();
  const sources = [
    ...paths.filter((path) => !path.endsWith("pi-tooling/index.ts")),
    ...await productionSources(join(extensionsDir, "pi-tooling")),
  ];
  for (const sourcePath of sources) {
    const source = await readFile(sourcePath, "utf8");
    for (const match of source.matchAll(/registerTool(?:<[^;{}]*>)?\s*\(\s*\{\s*name:\s*["']([^"']+)["']/g)) {
      const name = match[1];
      registrations.set(name, [...(registrations.get(name) ?? []), sourcePath]);
    }
  }
  const duplicates = [...registrations]
    .filter(([, registeredBy]) => registeredBy.length > 1)
    .map(([name, registeredBy]) => ({ name, registeredBy }));
  assert.deepEqual(duplicates, []);
});
