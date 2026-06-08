/**
 * Handoff Write Tool - Scoped file writes for subagent handoffs.
 *
 * Only allows writing to /tmp/ paths. This gives read-only agents
 * (plan, triage, diagnose, etc.) a safe way to produce handoff
 * files without granting unrestricted write access to the project.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { Type } from "typebox";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TMPDIR = os.tmpdir();

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "handoff_write",
    label: "Handoff Write",
    description:
      "Write a handoff file. ONLY accepts paths under /tmp/. Use this to produce design specs, reports, or handoff documents from subagent work. Creates the file if it doesn't exist, overwrites if it does.",
    parameters: Type.Object({
      path: Type.String({
        description: "File path. MUST start with /tmp/ — other paths are rejected.",
      }),
      content: Type.String({
        description: "Full file content to write.",
      }),
    }),

    async execute(_toolCallId, { path: filePath, content }) {
      // Normalize and validate — allow /tmp/ and os.tmpdir()
      const resolved = path.resolve(filePath);
      const allowedRoots = [
        "/tmp",
        path.resolve(TMPDIR),
      ];

      const isAllowed = allowedRoots.some(
        (root) =>
          resolved.startsWith(root + path.sep) || resolved === root,
      );

      if (!isAllowed) {
        return {
          content: [{
            type: "text",
            text: `Error: Path "${filePath}" is not under /tmp/. Only /tmp/ paths are allowed.`,
          }],
          isError: true,
        };
      }

      await fs.promises.mkdir(path.dirname(resolved), { recursive: true });
      await fs.promises.writeFile(resolved, content, "utf-8");
      return {
        content: [{
          type: "text",
          text: `Handoff written to ${resolved} (${content.split("\n").length} lines)`,
        }],
      };
    },
  });
}
