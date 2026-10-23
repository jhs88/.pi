import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface } from "node:readline";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const host = process.env.PI_TEST_PACKAGE ?? path.join(
  root, "agent/install/releases",
  readFileSync(path.join(root, "agent/install/current-version"), "utf8").trim(),
  "node_modules/@earendil-works/pi-coding-agent",
);
const { loadExtensions } = await import(pathToFileURL(path.join(host, "dist/core/extensions/loader.js")));
const loaded = await loadExtensions([
  path.join(root, "agent/git/github.com/jhs88/pi-tooling/ask-user/index.ts"),
  path.join(root, "agent/extensions/ask-user-rpc.ts"),
], root);
assert.deepEqual(loaded.errors, []);
const ask = loaded.extensions.flatMap((extension) => [...extension.tools.values()])
  .find((tool) => tool.definition.name === "ask_user").definition;
const [adapt] = loaded.extensions.flatMap((extension) => extension.handlers.get("tool_result") ?? []);
const params = {
  question: "Which demo?",
  options: [{ label: "Recording", description: "Record a walkthrough" }, { label: "Agents" }],
};

async function run({ input = params, select = async () => undefined,
  custom = async () => undefined, signal, mode = "rpc", hasUI = true } = {}) {
  const dialogs = [];
  const context = {
    mode, hasUI, signal,
    ui: {
      async select(title, options, opts) {
        dialogs.push({ method: "select", title, options, signal: opts.signal });
        return select(title, options, opts);
      },
      async input(title, placeholder, opts) {
        dialogs.push({ method: "input", title, placeholder, signal: opts.signal });
        return custom(title, placeholder, opts);
      },
    },
  };
  const original = await ask.execute("test", input, signal, undefined, { ...context, mode: "rpc" });
  assert.equal(original.details.outcome, "no-ui", "exercise the installed tool's real fallback");
  const event = { type: "tool_result", toolName: "ask_user", toolCallId: "test",
    input, ...original, isError: false };
  const replacement = await adapt(event, context);
  return { result: replacement ?? original, replacement, dialogs, event, context };
}

test("RPC selection replaces the real no-ui result with the original label and index", async () => {
  const { result, dialogs } = await run({ select: async (_title, options) => options[0] });
  assert.equal(dialogs.length, 1);
  assert.equal(dialogs[0].title, params.question);
  assert.match(dialogs[0].options[0], /Record a walkthrough/);
  assert.equal(result.details.outcome, "selected");
  assert.equal(result.details.answer, "Recording");
  assert.equal(result.details.index, 1);
  assert.match(result.content[0].text, /User selected option 1: Recording/);
});

test("custom action opens an input dialog and returns typed text", async () => {
  const { result, dialogs } = await run({
    select: async (_title, options) => options.at(-1), custom: async () => "  Something else  ",
  });
  assert.deepEqual(dialogs.map((dialog) => dialog.method), ["select", "input"]);
  assert.equal(result.details.outcome, "custom");
  assert.equal(result.details.answer, "Something else");
  assert.equal(result.details.wasCustom, true);
  assert.equal(result.details.index, undefined);
});

test("typed answers returned directly by T3 select cards are preserved", async () => {
  const { result, dialogs } = await run({ select: async () => "My own answer" });
  assert.equal(dialogs.length, 1);
  assert.equal(result.details.outcome, "custom");
  assert.equal(result.details.answer, "My own answer");
});

test("blank custom answers return to the choices without fabricating an answer", async () => {
  let calls = 0;
  const { result, dialogs } = await run({
    select: async (_title, options) => calls++ === 0 ? options.at(-1) : options[1],
    custom: async () => "   ",
  });
  assert.equal(dialogs.length, 3);
  assert.equal(result.details.answer, "Agents");
  assert.equal(result.details.index, 2);
});

test("dismissing either dialog returns no answer", async () => {
  for (const select of [async () => undefined, async (_title, options) => options.at(-1)]) {
    const { result } = await run({ select });
    assert.equal(result.details.outcome, "dismissed");
    assert.equal(result.details.answer, null);
    assert.match(result.content[0].text, /Do not assume an answer/);
  }
});

test("abort before or during a dialog stays distinct from dismissal", async () => {
  const before = new AbortController();
  before.abort();
  const first = await run({ signal: before.signal });
  assert.equal(first.dialogs.length, 0);
  assert.equal(first.result.details.outcome, "aborted");

  const during = new AbortController();
  const second = await run({ signal: during.signal,
    select: async (_title, _options, opts) => {
      assert.equal(opts.signal, during.signal);
      during.abort();
      return "A late answer";
    },
  });
  assert.equal(second.result.details.outcome, "aborted");
  assert.equal(second.result.details.answer, null);
});

test("duplicate labels retain their selected index", async () => {
  const input = { ...params, options: [{ label: "Same" }, { label: "Same" }] };
  const { result } = await run({ input, select: async (_title, options) => options[1] });
  assert.equal(result.details.answer, "Same");
  assert.equal(result.details.index, 2);
});

test("TUI, headless, unrelated tools, failures, and upstream RPC answers pass through", async () => {
  for (const config of [{ mode: "tui" }, { mode: "json" }, { hasUI: false }]) {
    const { replacement, dialogs } = await run(config);
    assert.equal(replacement, undefined);
    assert.deepEqual(dialogs, []);
  }
  const { event, context } = await run();
  for (const change of [{ toolName: "other" }, { isError: true },
    { details: { outcome: "selected", answer: "Upstream answer" } },
    { input: { question: "Malformed", options: [null, null] } }]) {
    assert.equal(await adapt({ ...event, ...change }, context), undefined);
  }
});

// A local model fixture drives the real agent tool hooks and RPC transport.
// No model service, credentials, or changes to the user's settings are needed.
for (const custom of [false, true]) {
  test(`real Pi RPC round trip: ${custom ? "custom answer" : "option selection"}`, { timeout: 20000 }, async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "pi-question-rpc-"));
    let child;
    let modelAnswer;
    let calls = 0;
    const dialogs = [];
    const ended = [];
    const stderr = [];
    const expected = custom ? "User wrote their own answer: Typed over RPC" : "User selected option 2: Agents";
    const server = createServer(async (request, response) => {
      let body = "";
      for await (const chunk of request) body += chunk;
      const input = JSON.parse(body);
      const first = calls++ === 0;
      if (!first) modelAnswer = input.messages.findLast((message) => message.role === "tool")?.content;
      const delta = first ? {
        role: "assistant", tool_calls: [{ index: 0, id: "ask-rpc", type: "function",
          function: { name: "ask_user", arguments: JSON.stringify(params) } }],
      } : { role: "assistant", content: "RPC fixture complete" };
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      for (const [content, reason] of [[delta, null], [{}, first ? "tool_calls" : "stop"]]) {
        response.write(`data: ${JSON.stringify({ id: "fixture", object: "chat.completion.chunk",
          created: 1, model: "fixture", choices: [{ index: 0, delta: content, finish_reason: reason }] })}\n\n`);
      }
      response.end("data: [DONE]\n\n");
    });
    try {
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const fixture = path.join(directory, "provider.ts");
      await writeFile(fixture, `export default function(pi) {
        pi.registerProvider("questionnaire-fixture", {
          baseUrl: "http://127.0.0.1:${server.address().port}/v1", apiKey: "local-fixture",
          api: "openai-completions", models: [{ id: "fixture", name: "Fixture", reasoning: false,
            input: ["text"], cost: {input:0,output:0,cacheRead:0,cacheWrite:0},
            contextWindow: 32768, maxTokens: 256, compat: {supportsStore:false} }]
        });
      }`);
      child = spawn(process.execPath, [path.join(host, "dist/cli.js"),
        "--mode", "rpc", "--no-extensions", "--no-mcp", "--no-skills",
        "--no-context-files", "--no-prompt-templates", "--offline", "--no-session",
        "--provider", "questionnaire-fixture", "--model", "fixture", "--thinking", "off",
        "-e", fixture,
        "-e", path.join(root, "agent/git/github.com/jhs88/pi-tooling/ask-user/index.ts"),
        "-e", path.join(root, "agent/extensions/ask-user-rpc.ts"),
      ], { cwd: directory, env: { ...process.env, PI_CODING_AGENT_DIR: directory },
        stdio: ["pipe", "pipe", "pipe"] });
      child.stderr.on("data", (chunk) => stderr.push(chunk.toString()));
      const lines = createInterface({ input: child.stdout });
      const send = (message) => child.stdin.write(`${JSON.stringify(message)}\n`);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`RPC timed out: ${stderr.join("")}`)), 15000);
        child.once("error", (error) => { clearTimeout(timeout); reject(error); });
        child.once("exit", (code) => { clearTimeout(timeout); reject(new Error(`Pi exited ${code}: ${stderr.join("")}`)); });
        lines.on("line", (line) => {
          let event;
          try { event = JSON.parse(line); } catch { return; }
          if (event.type === "extension_ui_request") {
            dialogs.push(event.method);
            if (event.method === "select") {
              assert.equal(event.title, params.question);
              send({ type: "extension_ui_response", id: event.id,
                value: custom ? event.options.at(-1) : event.options[1] });
            } else if (event.method === "input") {
              send({ type: "extension_ui_response", id: event.id, value: "Typed over RPC" });
            }
          }
          if (event.type === "tool_execution_end") ended.push(event);
          if (event.type === "agent_settled") { clearTimeout(timeout); resolve(); }
          if (event.type === "response" && event.success === false) {
            clearTimeout(timeout); reject(new Error(JSON.stringify(event)));
          }
        });
        send({ id: "test-prompt", type: "prompt", message: "Run the fixture question." });
      });
      assert.equal(calls, 2);
      assert.equal(modelAnswer, expected, "the model must receive the actual RPC answer");
      assert.deepEqual(dialogs, custom ? ["select", "input"] : ["select"]);
      const answer = ended.find((event) => event.toolName === "ask_user");
      assert.equal(answer.isError, false);
      assert.equal(answer.result.details.outcome, custom ? "custom" : "selected");
      lines.close();
    } finally {
      if (child && child.exitCode === null) {
        const exited = new Promise((resolve) => child.once("exit", resolve));
        child.kill("SIGTERM");
        const kill = setTimeout(() => child.kill("SIGKILL"), 2000);
        await exited;
        clearTimeout(kill);
      }
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await rm(directory, { recursive: true, force: true });
    }
  });
}
