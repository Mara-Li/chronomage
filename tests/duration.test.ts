import { describe, expect, it } from "vitest";
import { parseDurationLocalized } from "../src/duration";

describe("parseDurationLocalized", () => {
	it("should parse English durations", () => {
		expect(parseDurationLocalized("1h30m", "en")).toBe(90 * 60 * 1000);
		expect(parseDurationLocalized("2d", "en")).toBe(2 * 24 * 60 * 60 * 1000);
	});
	it("should parse French durations", () => {
		expect(parseDurationLocalized("1 heure 30 minutes", "fr")).toBe(90 * 60 * 1000);
		expect(parseDurationLocalized("2 jours", "fr")).toBe(2 * 24 * 60 * 60 * 1000);
	});
	it("should fallback to English if locale is unknown", () => {
		expect(parseDurationLocalized("1h30m", "unknown")).toBe(90 * 60 * 1000);
	});
	it("should throw on invalid input", () => {
		expect(() => parseDurationLocalized("invalid", "en")).toThrow();
		expect(() => parseDurationLocalized("1x", "en")).toThrow();
	});
	it("Should parse spanish durations with another locale", () => {
		expect(parseDurationLocalized("1 hora 30 minutos", "en")).toBe(90 * 60 * 1000);
		expect(parseDurationLocalized("2 días", "en")).toBe(2 * 24 * 60 * 60 * 1000);
	});
});
