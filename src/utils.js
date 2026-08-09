export const SRT_TIMESTAMP_LINE =
  /^(?<start>\d{1,2}:\d{2}:\d{2},\d{1,3})\s*-->\s*(?<end>\d{1,2}:\d{2}:\d{2},\d{1,3})(?<settings>.*)$/;

export const VTT_TIMESTAMP_LINE =
  /^(?<start>\d{1,2}:\d{2}:\d{2}\.\d{1,3})\s*-->\s*(?<end>\d{1,2}:\d{2}:\d{2}\.\d{1,3})(?<settings>.*)$/;

export function assertString(input, functionName) {
  if (typeof input !== "string") {
    throw new TypeError(`${functionName} expected a string input.`);
  }
}

export function normalizeText(input) {
  return input
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
}

export function normalizeTimestamp(timestamp, separator) {
  const [time, milliseconds = "000"] = timestamp.replace(",", ".").split(".");
  return `${padHour(time)}${separator}${milliseconds.padEnd(3, "0").slice(0, 3)}`;
}

export function normalizeSettings(settings) {
  const trimmed = settings.trim();
  return trimmed ? ` ${trimmed}` : "";
}

function padHour(time) {
  if (time.split(":")[0].length === 1) {
    return `0${time}`;
  }

  return time;
}
