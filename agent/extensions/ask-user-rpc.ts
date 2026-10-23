import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface Option {
  label: string;
  description?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOption(value: unknown): value is Option {
  return isRecord(value) && typeof value.label === "string" &&
    (value.description === undefined || typeof value.description === "string");
}

/** Bridge Pi Tooling's terminal-only fallback to the standard RPC dialogs. */
export default function askUserRpc(pi: ExtensionAPI) {
  pi.on("tool_result", async (event, ctx) => {
    // Only recover this specific fallback. A future upstream RPC implementation
    // will return its answer directly and this adapter will leave it alone.
    if (event.toolName !== "ask_user" || event.isError ||
        ctx.mode !== "rpc" || !ctx.hasUI ||
        !isRecord(event.details) || event.details.outcome !== "no-ui") return;

    const { question, options } = event.input;
    if (typeof question !== "string" || !Array.isArray(options) ||
        options.length < 2 || options.length > 5 || !options.every(isOption)) return;

    const details = event.details;
    const signal = ctx.signal;
    const reply = (
      outcome: "selected" | "custom" | "dismissed" | "aborted",
      answer: string | null = null,
      index?: number,
    ) => ({
      content: [{ type: "text" as const, text:
        outcome === "selected" ? `User selected option ${index}: ${answer}` :
        outcome === "custom" ? `User wrote their own answer: ${answer}` :
        outcome === "aborted" ? "The ask_user interaction ended because the agent turn was aborted. The user did not answer." :
        "User dismissed the question without answering. Do not assume an answer; proceed accordingly or ask differently.",
      }],
      details: {
        ...details,
        question,
        options: options.map((option) => option.label),
        outcome,
        answer,
        wasCustom: outcome === "custom",
        index,
      },
    });
    const cancelled = () => reply(signal?.aborted ? "aborted" : "dismissed");
    if (signal?.aborted) return cancelled();

    // Numbered display strings preserve option identity even with duplicate
    // labels, descriptions, or a label matching the custom-answer action.
    const choices = options.map((option, index) =>
      `${index + 1}. ${option.label}${option.description ? ` — ${option.description}` : ""}`,
    );
    const customChoice = "Write my own answer…";
    while (!signal?.aborted) {
      const selected = await ctx.ui.select(question, [...choices, customChoice], { signal });
      if (signal?.aborted || selected === undefined) return cancelled();
      const index = choices.indexOf(selected);
      if (index !== -1) return reply("selected", options[index].label, index + 1);

      // T3 can return a typed answer directly from a select card. RPC clients
      // with only fixed choices use the explicit custom-answer input instead.
      const answer = selected === customChoice
        ? await ctx.ui.input(question, "Write your answer", { signal })
        : selected;
      if (signal?.aborted || answer === undefined) return cancelled();
      if (answer.trim()) return reply("custom", answer.trim());
    }
    return cancelled();
  });
}
