import {
  VTT_TIMESTAMP_LINE,
  assertString,
  normalizeText,
  normalizeTimestamp,
} from "./utils.js";

const NOTE_BLOCK = /^NOTE(?:\s|$)/;
const STYLE_BLOCK = /^STYLE(?:\s|$)/;
const REGION_BLOCK = /^REGION(?:\s|$)/;

/**
 * Convert WebVTT (.vtt) subtitle text to SubRip (.srt) text.
 *
 * @param {string} input
 * @param {{ preserveCueIds?: boolean }} [options]
 * @returns {string}
 */
export function vttToSrt(input, options = {}) {
  assertString(input, "vttToSrt");

  const warnings = validateVtt(input);
  const invalidTimestamp = warnings.find(warning => warning.code === "invalid-timestamp");

  if (invalidTimestamp) {
    throw new Error(`${invalidTimestamp.message} Line ${invalidTimestamp.line}.`);
  }

  const normalizedInput = stripWebVttHeader(normalizeText(input));
  const blocks = normalizedInput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const cues = [];
  let cueNumber = 1;

  for (const block of blocks) {
    const lines = block.split("\n");

    if (isMetadataBlock(lines[0])) {
      continue;
    }

    const timingIndex = lines.findIndex(line => VTT_TIMESTAMP_LINE.test(line.trim()));

    if (timingIndex === -1) {
      continue;
    }

    const cueIdLines = lines.slice(0, timingIndex).filter(Boolean);
    const timingLine = lines[timingIndex].trim();
    const textLines = lines.slice(timingIndex + 1);
    const match = timingLine.match(VTT_TIMESTAMP_LINE);

    if (!match?.groups || textLines.length === 0) {
      continue;
    }

    cues.push(String(options.preserveCueIds && cueIdLines.length > 0 ? cueIdLines.join(" ") : cueNumber));
    cues.push(
      `${normalizeTimestamp(match.groups.start, ",")} --> ${normalizeTimestamp(
        match.groups.end,
        ",",
      )}`,
    );
    cues.push(...textLines);
    cues.push("");
    cueNumber += 1;
  }

  return cues.length === 0 ? "" : `${cues.join("\n").trimEnd()}\n`;
}

/**
 * Return basic validation warnings for VTT input.
 *
 * @param {string} input
 * @returns {{ code: string, line: number, message: string }[]}
 */
export function validateVtt(input) {
  assertString(input, "validateVtt");

  const lines = normalizeText(input).split("\n");
  const warnings = [];
  let timingLines = 0;
  let timestampAttempts = 0;

  lines.forEach((line, index) => {
    if (line.includes("-->")) {
      timestampAttempts += 1;

      if (!VTT_TIMESTAMP_LINE.test(line.trim())) {
        warnings.push({
          code: "invalid-timestamp",
          line: index + 1,
          message: "Invalid timestamp line. Expected HH:MM:SS.mmm --> HH:MM:SS.mmm.",
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
      message: "No VTT cues found.",
    });
  }

  return warnings;
}

function stripWebVttHeader(input) {
  return input.replace(/^WEBVTT[^\n]*(?:\n+)?/, "").trim();
}

function isMetadataBlock(firstLine) {
  return NOTE_BLOCK.test(firstLine) || STYLE_BLOCK.test(firstLine) || REGION_BLOCK.test(firstLine);
}
