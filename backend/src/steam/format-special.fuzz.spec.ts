import * as fc from "fast-check";

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS ?? 250);
const FUZZ_SEED = Number(process.env.FUZZ_SEED ?? 0);
const fcOpts = { numRuns: FUZZ_RUNS, ...(FUZZ_SEED ? { seed: FUZZ_SEED } : {}) };
import { describe, expect, it } from "vitest";
import { formatSpecial } from "./format-special.js";

const specialArb = fc.record({
  id: fc.integer({ min: 0, max: 99999999 }),
  name: fc.string({ maxLength: 120 }),
  original_price: fc.integer({ min: 0, max: 1000000 }),
  final_price: fc.integer({ min: 0, max: 1000000 }),
  discount_percent: fc.integer({ min: -100, max: 100 }),
  discount_expiration: fc.integer({ min: 0, max: 4102444800 }),
  header_image: fc.string({ maxLength: 300 }),
});

describe("formatSpecial fuzz", () => {
  it("formats any well-shaped special exactly", () => {
    fc.assert(
      fc.property(specialArb, (special) => {
        const payload = formatSpecial(special) as any;
        const dollars = (cents: number) => "$" + (cents / 100).toFixed(2);

        expect(payload.username).toBe("Steam Specials Bot");
        expect(payload.embeds).toHaveLength(1);
        expect(payload.embeds[0].title).toBe(special.name);
        expect(payload.embeds[0].description).toBe(
          `~~${dollars(special.original_price)}~~\n${dollars(special.final_price)} (-${special.discount_percent}%)`,
        );
        expect(payload.embeds[0].url).toBe(`https://store.steampowered.com/app/${special.id}`);
        expect(payload.embeds[0].footer.text).toBe(
          "Last until " + new Date(special.discount_expiration * 1000).toLocaleString(),
        );
      }),
      fcOpts,
    );
  });

  it("never hangs or returns a malformed payload for arbitrary input", () => {
    fc.assert(
      fc.property(fc.anything(), (input) => {
        let threw = false;
        let payload: any = null;
        try {
          payload = formatSpecial(input);
        } catch {
          threw = true;
        }
        if (!threw) {
          expect(payload?.embeds).toHaveLength(1);
          expect(typeof payload.embeds[0]?.description).toBe("string");
        }
      }),
      fcOpts,
    );
  });
});
