import {
  SRT_TIMESTAMP_LINE,
  assertString,
  normalizeSettings,
  normalizeText,
  normalizeTimestamp,
} from "./utils.js";

/**
 * Convert SubRip (.srt) subtitle text to WebVTT (.vtt) text.
 *
 * @param {string} input
 * @param {{ preserveCueIds?: boolean }} [options]
 * @returns {string}
 */
export function srtToVtt(input, options = {}) {
  assertString(input, "srtToVtt");

  const warnings = validateSrt(input);
  const invalidTimestamp = warnings.find(warning => warning.code === "invalid-timestamp");

  if (invalidTimestamp) {
    throw new Error(`${invalidTimestamp.message} Line ${invalidTimestamp.line}.`);
  }

  const normalizedInput = normalizeText(input);
  const blocks = normalizedInput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const cues = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex(line => SRT_TIMESTAMP_LINE.test(line.trim()));

    if (timingIndex === -1) {
      continue;
    }

    const cueIdLines = lines.slice(0, timingIndex).filter(Boolean);
    const timingLine = lines[timingIndex].trim();
    const textLines = lines.slice(timingIndex + 1);
    const match = timingLine.match(SRT_TIMESTAMP_LINE);

    if (!match?.groups || textLines.length === 0) {
      continue;
    }

    if (options.preserveCueIds && cueIdLines.length > 0) {
      cues.push(cueIdLines.join(" "));
    }

    cues.push(
      `${normalizeTimestamp(match.groups.start, ".")} --> ${normalizeTimestamp(
        match.groups.end,
        ".",
      )}${normalizeSettings(match.groups.settings)}`,
    );
    cues.push(...textLines);
    cues.push("");
  }

  if (cues.length === 0) {
    return "WEBVTT\n\n";
  }

  return `WEBVTT\n\n${cues.join("\n").trimEnd()}\n`;
}

/**
 * Return basic validation warnings for SRT input.
 *
 * @param {string} input
 * @returns {{ code: string, line: number, message: string }[]}
 */
export function validateSrt(input) {
  assertString(input, "validateSrt");

  const lines = normalizeText(input).split("\n");
  const warnings = [];
  let timingLines = 0;
  let timestampAttempts = 0;

  lines.forEach((line, index) => {
    if (line.includes("-->")) {
      timestampAttempts += 1;

      if (!SRT_TIMESTAMP_LINE.test(line.trim())) {
        warnings.push({
          code: "invalid-timestamp",
          line: index + 1,
          message: "Invalid timestamp line. Expected HH:MM:SS,mmm --> HH:MM:SS,mmm.",
        });
      } else {
        timingLines += 1;
      }
    }
  });

  if (timingLines === 0 && timestampAttempts === 0) {
    warnings.push({
      code: "no-cues",
      line: 1,
      message: "No SRT cues found.",
    });
  }

  return warnings;
}
