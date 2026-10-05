// Offline checks against the installed Pi SDK and subagents parsers; no sessions or servers.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const agentDir = join(root, "agent");
const sdkDir = process.env.PI_SDK_DIR ?? resolve(
  dirname(realpathSync(execFileSync("which", ["pi"], { encoding: "utf8" }).trim())), "../..",
);
const subagentsDir = process.env.PI_SUBAGENTS_DIR ?? join(
  homedir(), ".pi/agent/npm/node_modules/@tintinweb/pi-subagents",
);
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
assert.equal(json(join(subagentsDir, "package.json")).version, "0.19.0");

const globalNpmDir = execFileSync("npm", ["root", "--global"], { encoding: "utf8" }).trim();
for (const adapterDir of new Set([
  join(agentDir, "npm/node_modules/pi-mcp-adapter"),
  resolve(subagentsDir, "../../pi-mcp-adapter"),
  join(globalNpmDir, "pi-mcp-adapter"),
])) {
  assert(!existsSync(adapterDir), `Legacy MCP adapter remains at ${adapterDir}; follow the README migration cleanup steps`);
}
console.log("PASS legacy adapter cleanup: no managed or global installation");

// Pi itself uses Jiti to load extension sources. Disable its disk cache so checks are read-only.
const { createJiti } = await import(pathToFileURL(join(sdkDir, "node_modules/jiti/lib/jiti.mjs")));
const jiti = createJiti(import.meta.url, {
  fsCache: false,
  alias: {
    "@earendil-works/pi-coding-agent": join(sdkDir, "dist/index.js"),
    "@earendil-works/pi-ai": join(sdkDir, "node_modules/@earendil-works/pi-ai/dist/index.js"),
    "@earendil-works/pi-tui": join(sdkDir, "node_modules/@earendil-works/pi-tui/dist/index.js"),
    typebox: join(sdkDir, "node_modules/typebox"),
  },
});
process.env.PI_CODING_AGENT_DIR = agentDir;
const { loadMcpConfig, getMcpToolExposure } = await jiti.import(join(sdkDir, "dist/extensions/mcp/config.js"));
const { loadCustomAgents } = await jiti.import(join(subagentsDir, "src/custom-agents.ts"));
const { buildAgentPrompt } = await jiti.import(join(subagentsDir, "src/prompts.ts"));
const { parseExtSelectors, extensionCanonicalName, installExtensionToolScope } = await jiti.import(
  join(subagentsDir, "src/agent-runner.ts"),
);

const settings = json(join(agentDir, "settings.json"));
assert(settings.extensions.includes("+builtin:mcp"));
assert(!settings.packages.some((pkg) => /^npm:pi-mcp-adapter(?:@|$)/.test(
  typeof pkg === "string" ? pkg : pkg.source,
)), "Legacy MCP adapter must be removed from configured packages");
assert(settings.packages.includes("npm:@tintinweb/pi-subagents@0.19.0"));
assert.equal(settings.enableSkillCommands, true);
const navigation = {
  grepika: ["toc", "outline", "search", "get"],
  tilth: ["tilth_search", "tilth_read"],
};
const names = Object.entries(navigation).flatMap(([server, tools]) => tools.map((tool) => `mcp__${server}__${tool}`));
const selectors = names.map((name) => `ext:builtin:mcp/${name}`);
const loaded = loadMcpConfig({ agentDir, cwd: root, projectTrusted: false });
assert.deepEqual(loaded.errors, []);
assert.deepEqual(loaded.servers.map((s) => s.name).sort(), ["firecrawl", "grepika", "tilth"]);
for (const { name, config, source, scope } of loaded.servers) {
  assert.equal(source, join(agentDir, "mcp.json"));
  assert.equal(scope, "global");
  assert.equal(config.command, "npx");
  assert(!("directTools" in config));
  if (name === "firecrawl") {
    assert.deepEqual(config, {
      command: "npx", args: ["-y", "firecrawl-mcp"],
      env: { FIRECRAWL_API_URL: "http://172.16.8.179:3002" }, exposure: "codemode",
    });
    assert.equal(getMcpToolExposure(config, "firecrawl_scrape"), "codemode");
  } else {
    assert.equal(config.exposure, "codemode");
    assert.deepEqual(config.toolExposure, Object.fromEntries(navigation[name].map((t) => [t, "direct"])));
    for (const tool of navigation[name]) assert.equal(getMcpToolExposure(config, tool), "direct");
    assert.equal(getMcpToolExposure(config, "other_offered_tool"), "codemode");
  }
}
console.log("PASS native config parser: three personal servers, six direct tools, codemode Firecrawl");

const builtinLists = {
  architect: ["read", "grep", "find", "ls"],
  build: ["read", "grep", "find", "ls", "write", "edit", "bash"],
  cleaner: ["read", "grep", "find", "ls", "write", "edit", "bash"],
  coder: ["read", "grep", "find", "ls", "write", "edit", "bash"],
  docs: ["read", "grep", "find", "ls", "write", "edit"],
  hardener: ["read", "grep", "find", "ls", "write", "edit", "bash"],
  qa: ["read", "grep", "find", "ls"],
  scout: ["read", "grep", "find", "ls"],
  specifier: ["read", "grep", "find", "ls"],
};
const profiles = loadCustomAgents(root, true);
assert.deepEqual([...profiles.keys()].sort(), Object.keys(builtinLists).sort());
for (const [name, profile] of profiles) {
  assert.deepEqual(profile.builtinToolNames, builtinLists[name], name);
  assert.equal(profile.inheritContext, false, name);
  if (["scout", "build", "docs"].includes(name)) {
    assert.deepEqual(profile.extSelectors, [...selectors, "ext:session-name"], name);
    assert.deepEqual(profile.extensions, name === "scout" ? ["builtin:mcp", "session-name"] : true);
  } else {
    assert.equal(profile.extensions, false, name);
    assert.equal(profile.extSelectors, undefined, name);
  }
  const rendered = buildAgentPrompt(profile, root, { isGitRepo: true, branch: "offline-check", platform: "linux" }, "PARENT");
  assert(rendered.includes(`<active_agent name="${name}"/>`));
  assert(rendered.includes(profile.systemPrompt.trim()));
  assert.equal(rendered.startsWith("PARENT"), profile.promptMode === "append");
}
assert.deepEqual(profiles.get("docs").skills, ["technical-writing", "unslop"]);
assert.equal(profiles.get("scout").thinking, "low");
console.log("PASS installed subagents parser and prompt renderer: all nine current roles and restrictions");

// Exercise the installed scope guard at its interface, with a fake late-registering MCP adapter.
assert.equal(extensionCanonicalName("builtin:mcp"), "builtin:mcp", "Apply compat:subagents before running profile scope checks");
for (const name of ["scout", "build", "docs"]) {
  const profile = profiles.get(name);
  const selection = parseExtSelectors(profile.extSelectors);
  assert.deepEqual([...selection.narrowing.get("builtin:mcp")], names);
  const mcp = { path: "builtin:mcp", tools: new Map(names.slice(0, 2).map((n) => [n, {}])) };
  const extensions = [mcp, { path: "builtin:codemode", tools: new Map([["codemode", {}]]) }];
  let active = [...profile.builtinToolNames];
  let onEvent;
  const session = {
    agent: {},
    getAllTools: () => [
      ...profile.builtinToolNames.map((n) => ({ name: n, exposure: "direct" })),
      ...extensions.flatMap((e) => [...e.tools.keys()].map((n) => ({ name: n, exposure: "direct" }))),
    ],
    getActiveToolNames: () => active,
    setActiveToolsByName: (next) => { active = next; },
    subscribe: (listener) => { onEvent = listener; },
  };
  installExtensionToolScope(session, {
    loader: { getExtensions: () => ({ extensions }) }, toolNames: profile.builtinToolNames,
    extNames: selection.extNames, narrowing: selection.narrowing, readmitToolNames: new Set(),
  });
  for (const tool of [...names, "mcp__tilth__tilth_write", "tool_search"]) mcp.tools.set(tool, {});
  onEvent({ type: "turn_end" });
  assert.deepEqual(active, [...profile.builtinToolNames, ...names]);
  for (const tool of names) assert.equal(await session.agent.beforeToolCall({ toolCall: { name: tool } }), undefined);
  const forbidden = ["codemode", "tool_search", "mcp__tilth__tilth_write", "Agent", "workflow", "bg_start", "ask_user"];
  if (name !== "build") forbidden.push("bash");
  if (name === "scout") forbidden.push("write", "edit");
  for (const tool of forbidden) assert.equal((await session.agent.beforeToolCall({ toolCall: { name: tool } })).block, true);
}
console.log("PASS installed scope guard with mock tools: late navigation allowed; MCP mutation, discovery and delegation excluded");
console.log("No model requests, MCP connections, package installation or disk cache writes performed.");
