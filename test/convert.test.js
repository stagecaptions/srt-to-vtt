import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { srtToVtt, validateSrt } from "../src/index.js";

describe("srtToVtt", () => {
  it("converts basic SRT cues to WebVTT", () => {
    const srt = `1
00:00:01,000 --> 00:00:03,500
Hello from StageCaptions.

2
00:00:04,000 --> 00:00:05,250
This is a second cue.`;

    assert.equal(
      srtToVtt(srt),
      `WEBVTT

00:00:01.000 --> 00:00:03.500
Hello from StageCaptions.

00:00:04.000 --> 00:00:05.250
This is a second cue.
`,
    );
  });

  it("preserves multiline cue text", () => {
    const srt = `1
00:00:01,000 --> 00:00:04,000
First line
Second line`;

    assert.equal(
      srtToVtt(srt),
      `WEBVTT

00:00:01.000 --> 00:00:04.000
First line
Second line
`,
    );
  });

  it("can preserve SRT indexes as WebVTT cue identifiers", () => {
    const srt = `42
00:00:01,000 --> 00:00:04,000
Named cue`;

    assert.equal(
      srtToVtt(srt, { preserveCueIds: true }),
      `WEBVTT

42
00:00:01.000 --> 00:00:04.000
Named cue
`,
    );
  });

  it("normalizes BOM, CRLF, and short millisecond values", () => {
    const srt = "\uFEFF1\r\n00:00:01,5 --> 00:00:04,25\r\nHello";

    assert.equal(
      srtToVtt(srt),
      `WEBVTT

00:00:01.500 --> 00:00:04.250
Hello
`,
    );
  });
});

describe("validateSrt", () => {
  it("returns no warnings for valid SRT", () => {
    const warnings = validateSrt(`1
00:00:01,000 --> 00:00:02,000
Hello`);

    assert.deepEqual(warnings, []);
  });

  it("warns on invalid timestamp lines", () => {
    const warnings = validateSrt(`1
00:00:01 --> 00:00:02
Hello`);

    assert.deepEqual(warnings, [
      {
        line: 2,
        message: "Invalid timestamp line. Expected HH:MM:SS,mmm --> HH:MM:SS,mmm.",
      },
    ]);
  });
});
