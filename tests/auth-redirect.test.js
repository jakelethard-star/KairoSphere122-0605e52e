import test from "node:test";
import assert from "node:assert/strict";
import { resolveAuthRedirectUrl } from "../src/core/auth-redirect.js";

test("defaults confirmation links to the canonical Pages application", () => {
  assert.equal(
    resolveAuthRedirectUrl(),
    "https://jakelethard-star.github.io/KairoSphere122-0605e52e/"
  );
});

test("uses an explicitly configured redirect destination", () => {
  assert.equal(
    resolveAuthRedirectUrl("https://example.test/auth/callback"),
    "https://example.test/auth/callback"
  );
});

test("normalizes a configured destination with a trailing slash", () => {
  assert.equal(
    resolveAuthRedirectUrl("https://example.test/auth/"),
    "https://example.test/auth/"
  );
});

test("rejects malformed redirect destinations", () => {
  assert.throws(() => resolveAuthRedirectUrl("not a URL"), TypeError);
});
