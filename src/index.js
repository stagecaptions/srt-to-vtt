const TIMESTAMP_LINE =
  /^(?<start>\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(?<end>\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})(?<settings>.*)$/;

/**
 * Convert SubRip (.srt) subtitle text to WebVTT (.vtt) text.
 *
 * @param {string} input
 * @param {{ preserveCueIds?: boolean }} [options]
 * @returns {string}
 */
export function srtToVtt(input, options = {}) {
  if (typeof input !== "string") {
    throw new TypeError("srtToVtt expected a string input.");
  }

  const normalizedInput = normalizeText(input);
  const blocks = normalizedInput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const cues = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const timingIndex = lines.findIndex(line => TIMESTAMP_LINE.test(line.trim()));

    if (timingIndex === -1) {
      continue;
    }

    const cueIdLines = lines.slice(0, timingIndex).filter(Boolean);
    const timingLine = lines[timingIndex].trim();
    const textLines = lines.slice(timingIndex + 1);
    const match = timingLine.match(TIMESTAMP_LINE);

    if (!match?.groups || textLines.length === 0) {
      continue;
    }

    if (options.preserveCueIds && cueIdLines.length > 0) {
      cues.push(cueIdLines.join(" "));
    }

    cues.push(
      `${normalizeTimestamp(match.groups.start)} --> ${normalizeTimestamp(
        match.groups.end,
      )}${normalizeSettings(match.groups.settings)}`,
    );
    cues.push(...textLines);
    cues.push("");
  }

  return `WEBVTT\n\n${cues.join("\n").trimEnd()}\n`;
}

/**
 * Return basic validation warnings for SRT input.
 *
 * @param {string} input
 * @returns {{ line: number, message: string }[]}
 */
export function validateSrt(input) {
  if (typeof input !== "string") {
    throw new TypeError("validateSrt expected a string input.");
  }

  const lines = normalizeText(input).split("\n");
  const warnings = [];
  let timingLines = 0;
  let timestampAttempts = 0;

  lines.forEach((line, index) => {
    if (line.includes("-->")) {
      timestampAttempts += 1;

      if (!TIMESTAMP_LINE.test(line.trim())) {
        warnings.push({
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
      line: 1,
      message: "No SRT cues found.",
    });
  }

  return warnings;
}

function normalizeText(input) {
  return input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

function normalizeTimestamp(timestamp) {
  const [time, milliseconds = "000"] = timestamp.replace(",", ".").split(".");
  return `${padHour(time)}.${milliseconds.padEnd(3, "0").slice(0, 3)}`;
}

function padHour(time) {
  const parts = time.split(":");

  if (parts[0].length === 1) {
    return `0${time}`;
  }

  return time;
}

function normalizeSettings(settings) {
  const trimmed = settings.trim();
  return trimmed ? ` ${trimmed}` : "";
}
