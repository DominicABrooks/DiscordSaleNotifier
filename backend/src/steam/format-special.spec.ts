import { describe, expect, it } from "vitest";
import { formatSpecial } from "./format-special.js";

const special = {
  id: 275850,
  name: "No Man's Sky",
  original_price: 5999,
  final_price: 2399,
  discount_percent: 60,
  discount_expiration: 1787265600,
  header_image: "https://cdn.akamai.steamstatic.com/steam/apps/275850/header.jpg",
};

describe("formatSpecial", () => {
  it("builds the Discord embed payload", () => {
    const payload = formatSpecial(special) as any;

    expect(payload.username).toBe("Steam Specials Bot");
    expect(payload.embeds).toHaveLength(1);
    expect(payload.embeds[0].title).toBe("No Man's Sky");
    expect(payload.embeds[0].description).toBe("~~$59.99~~\n$23.99 (-60%)");
    expect(payload.embeds[0].url).toBe("https://store.steampowered.com/app/275850");
    expect(payload.avatarURL).toBe("https://cdn-icons-png.flaticon.com/512/220/220223.png");
    expect(payload.embeds[0].image.url).toBe(special.header_image);
    expect(payload.embeds[0].footer.text).toBe(
      "Last until " + new Date(special.discount_expiration * 1000).toLocaleString(),
    );
    expect(payload.embeds[0].footer.text).toContain("Last until ");
  });

  it("formats a zero-discount special", () => {
    const payload = formatSpecial({ ...special, original_price: 5999, final_price: 5999, discount_percent: 0 }) as any;

    expect(payload.embeds[0].description).toBe("~~$59.99~~\n$59.99 (-0%)");
  });
});
