import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { srtToVtt, validateSrt } from "../src/index.js";

describe("srtToVtt", () => {
  it("converts SRT cues to WebVTT", () => {
    const input = `1
00:00:01,000 --> 00:00:03,500
Hello from StageCaptions.

2
00:00:04,000 --> 00:00:05,250
This is a second cue.`;

    const output = srtToVtt(input);

    assert.equal(
      output,
      `WEBVTT

00:00:01.000 --> 00:00:03.500
Hello from StageCaptions.

00:00:04.000 --> 00:00:05.250
This is a second cue.
`,
    );
  });

  it("preserves multiline cue text", () => {
    const input = `1
00:00:01,000 --> 00:00:04,000
First line
Second line`;

    const output = srtToVtt(input);

    assert.equal(
      output,
      `WEBVTT

00:00:01.000 --> 00:00:04.000
First line
Second line
`,
    );
  });

  it("can preserve SRT indexes as WebVTT cue identifiers", () => {
    const input = `42
00:00:01,000 --> 00:00:04,000
Named cue`;

    const output = srtToVtt(input, { preserveCueIds: true });

    assert.equal(
      output,
      `WEBVTT

42
00:00:01.000 --> 00:00:04.000
Named cue
`,
    );
  });

  it("normalizes BOM, CRLF, and short millisecond values", () => {
    const input = "\uFEFF1\r\n00:00:01,5 --> 00:00:04,25\r\nHello";

    const output = srtToVtt(input);

    assert.equal(
      output,
      `WEBVTT

00:00:01.500 --> 00:00:04.250
Hello
`,
    );
  });

  it("throws on malformed timestamp lines", () => {
    const input = `1
00:00:01 --> 00:00:02
Hello`;

    assert.throws(
      () => srtToVtt(input),
      /Invalid timestamp line\. Expected HH:MM:SS,mmm --> HH:MM:SS,mmm\. Line 2\./,
    );
  });
});

describe("validateSrt", () => {
  it("returns no warnings for valid SRT", () => {
    const input = `1
00:00:01,000 --> 00:00:02,000
Hello`;

    const warnings = validateSrt(input);

    assert.deepEqual(warnings, []);
  });

  it("warns on invalid timestamp lines", () => {
    const input = `1
00:00:01 --> 00:00:02
Hello`;

    const warnings = validateSrt(input);

    assert.deepEqual(warnings, [
      {
        code: "invalid-timestamp",
        line: 2,
        message: "Invalid timestamp line. Expected HH:MM:SS,mmm --> HH:MM:SS,mmm.",
      },
    ]);
  });

  it("warns when no cues are found", () => {
    const input = "This is not an SRT file.";

    const warnings = validateSrt(input);

    assert.deepEqual(warnings, [
      {
        code: "no-cues",
        line: 1,
        message: "No SRT cues found.",
      },
    ]);
  });
});
