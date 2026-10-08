# Local decision models in Pi

Decision models answer typed questions about data. They do not replace the chat model running your Pi session. Pi calls them locally through codemode using llama.cpp's `/v1/systemone` endpoint.

## Install and connect

Requires Pi 1.1.0+ and llama.cpp 0.6.0+ with router support. Check `pi --version`. Install a current [llama.cpp release](https://github.com/ggml-org/llama.cpp/releases) for your hardware, or follow its [build instructions](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md).

1. Start a router without `--model` or `-m`. This local-only example provides an 8K context and batch capacity for the encoder models:

   ```sh
   mkdir -p ~/models
   llama-server --models-dir ~/models --no-models-autoload \
     --host 127.0.0.1 --port 8080 --jinja \
     --ctx-size 8192 --batch-size 8192 --ubatch-size 8192
   ```

   Use the appropriate GPU-enabled build for acceleration. These are starting settings, not memory guarantees. Encoder prompts must fit the physical batch; lower context and batch sizes together if necessary. For an existing router, keep its setup rather than launching a second one.

2. Start Pi with `pi --tools +codemode`. Run `/login llama.cpp`, enter `http://127.0.0.1:8080`, and leave the optional key blank unless your server requires one. For a remote LAN router, enter its URL instead; do not expose an unauthenticated router publicly.
3. Run `/llama`, select **Download model…**, and enter one of the IDs below. Select `Q8_0` to match our benchmark. Then select the downloaded model in `/llama` and load it. Start with one model; loading all four requires more memory. Cancel any unload action you do not intend.

   | Model | Download ID | Observed Q8_0 weight size |
   | --- | --- | --- |
   | Kev-4B | `ggml-org/Kev-4B-GGUF` | 4.47 GB |
   | lev | `ggml-org/lev-GGUF` | 4.47 GB |
   | Julia-1 | `ggml-org/Julia-1-GGUF` | 0.153 GB |
   | Laya | `ggml-org/Laya-GGUF` | 0.448 GB |

   Weight sizes exclude runtime memory. Keep your existing chat model selected; native decision models should not appear in `/model`.
4. Ask Pi to list `models.getAvailableOfType("classifier", "llama.cpp")` in codemode. Each native entry should use `api: "typesafe-system-one"`. If an entry uses `llama-cpp-classify`, check the router's `/models` for `architecture.output_modalities: ["decisions"]`, then open `/model` to refresh discovery and cancel without switching models. Older servers lack this metadata. A script-supplied `api` cannot override registration.

For persistent codemode access, merge `"defaultTools": ["+codemode"]` into `~/.pi/agent/settings.json`, preserving existing settings/tool selections, then `/reload`. The built-in llama.cpp and codemode extensions must be enabled. No custom provider or plugin is needed.

## Use from codemode

Ask Pi to run this script, or adapt the question and criteria to your task:

```js
const model = await models.getModelOfType("classifier", "llama.cpp", "ggml-org/Kev-4B-GGUF");
if (!model || model.api !== "typesafe-system-one") throw new Error("Native model not available");
const result = await models.classify(model, {
  state: { message: "The tests failed." },
  questions: {
    passed: { type: "bool", instructions: "Did the tests pass?", criteria: {
      true: "The tests passed", false: "The tests failed"
    } }
  }
});
if (result.stopReason !== "stop") throw new Error(result.errorMessage ?? result.stopReason);
text(result.answers);
```

- `bool` returns the probability of true. It is not a certainty or calibrated safety signal.
- `choice` takes named criteria and returns a label plus probabilities. Include an `unknown` or `other` option when your task needs it.
- `score` takes an ordered array of criteria and returns a probability-weighted level index, starting at 0. Rounding it does not recover the most-probable category.

Keep state structured and questions/criteria short. Evaluate the exact representation you will use. Native bool is translated to wire-level `noul` by Pi; use public `type: "bool"` in codemode.

## Which model to use

Our [local benchmark](benchmarks/decision-models/README.md) used 54 synthetic cases twice per model, totaling 432 requests. Recommendations below are task-specific candidates, not production accuracy guarantees.

| Model | Suggested use | Caveat from the broader benchmark |
| --- | --- | --- |
| **Kev-4B** | First candidate for general classification, latest-result checks, routing and urgency scoring | 46/46 categorical answers; lowest score error. Missed one nearest-level urgency check. Slower on long inputs. |
| **lev** | Alternative for ordinary structured classification and scoring | 44/46 categorical answers; followed two embedded instructions. One fetch failure, followed by two successful diagnostic retries. |
| **Julia-1** | Smallest/fastest candidate for task-specific ambiguity handling | 32/46 categorical answers. Passed these ambiguity/injection cases, but missed routing and latest-result checks. |
| **Laya** | Lightweight candidate for simple, clean routing | 10/10 routing cases, but only 30/46 categorical answers overall. Negation, missing results, injected instructions and input position exposed weaknesses. |

The broader results supersede our earlier recommendation to default to Laya based on trivial controls. Julia is smaller than Laya; both require task-specific validation. Kev and lev advertised 32K contexts in our deployment, but this benchmark tested only about 4K input tokens, not their full windows.

Do not use any of these models to authorize commands, file writes, or access to sensitive data. Passing six toy injection tests is not a security guarantee. Real session-history analysis, calibration, sustained concurrency and controlled sleep/reconnect behavior remain untested.

## References

- [Pi llama.cpp setup and classification](https://pi.dev/docs/latest/llama-cpp#classification)
- [Pi codemode API](https://pi.dev/docs/latest/codemode#classify)
- GGUF model cards: [Kev](https://huggingface.co/ggml-org/Kev-4B-GGUF), [lev](https://huggingface.co/ggml-org/lev-GGUF), [Julia](https://huggingface.co/ggml-org/Julia-1-GGUF), [Laya](https://huggingface.co/ggml-org/Laya-GGUF).
