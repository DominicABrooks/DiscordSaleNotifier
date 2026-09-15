import * as fc from "fast-check";

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 250);
const FUZZ_SEED = Number(process.env.FUZZ_SEED ?? 0);
const fcOpts = { numRuns: FUZZ_RUNS, ...(FUZZ_SEED ? { seed: FUZZ_SEED } : {}) };
import { describe, expect, it, vi } from "vitest";
import validator from "validator";
import { ValidateWebhookMiddleware } from "./validate-webhook.middleware.js";

const KNOWN_ERRORS = ["Input Webhook is not URL", "Input Webhook is not a Discord Webhook URL"];

function run(input: unknown) {
  const middleware = new ValidateWebhookMiddleware();
  const req = { body: { webhook: input } } as any;
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const res = { status } as any;
  const next = vi.fn();
  let threw: unknown = null;
  try {
    middleware.use(req, res, next);
  } catch (err) {
    threw = err;
  }
  return { json, status, next, threw };
}

describe("ValidateWebhookMiddleware fuzz", () => {
  it("only passes genuine Discord webhook URLs, rejects everything else with 400", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        const { json, status, next, threw } = run(input);
        expect(threw).toBeNull();

        if (next.mock.calls.length > 0) {
          expect(typeof input).toBe("string");
          expect(validator.isURL(input as string, { require_protocol: true })).toBe(true);
          expect(
            validator.matches(
              input as string,
              /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/,
            ),
          ).toBe(true);
          expect(status).not.toHaveBeenCalled();
        } else {
          expect(status).toHaveBeenCalledWith(400);
          expect(json).toHaveBeenCalledTimes(1);
          expect(KNOWN_ERRORS).toContain(json.mock.calls[0][0]?.error);
        }
      }),
      fcOpts,
    );
  });

  it("rejects plausible non-Discord URLs", () => {
    fc.assert(
      fc.property(fc.webUrl(), (url) => {
        const { next, status } = run(url);
        if (!/^https:\/\/discord(app)?\.com\/api\/webhooks\/\d{17,19}\/\S+$/.test(url)) {
          expect(next).not.toHaveBeenCalled();
          expect(status).toHaveBeenCalledWith(400);
        }
      }),
      fcOpts,
    );
  });
});
