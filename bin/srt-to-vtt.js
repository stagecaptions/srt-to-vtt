#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { srtToVtt, validateSrt, validateVtt, vttToSrt } from "../src/index.js";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

if (args.includes("--version") || args.includes("-v")) {
  const packageJsonUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8"));
  console.log(packageJson.version);
  process.exit(0);
}

const preserveCueIds = consumeFlag(args, "--preserve-cue-ids");
const validateOnly = consumeFlag(args, "--validate");
const reverse = consumeFlag(args, "--reverse");
const toFormat = consumeOption(args, "--to");

const unknownOption = args.find(arg => arg.startsWith("-"));

if (unknownOption) {
  console.error(`Unknown option: ${unknownOption}`);
  printHelp();
  process.exit(1);
}

const positional = args.filter(arg => !arg.startsWith("-"));

if (positional.length < 1 || positional.length > 2) {
  printHelp();
  process.exit(1);
}

const [inputPath] = positional;
const direction = resolveDirection(inputPath, { reverse, toFormat });
const outputPath = positional[1] ?? defaultOutputPath(inputPath, direction);
const input = await readFile(inputPath, "utf8");
const warnings = direction === "vtt-to-srt" ? validateVtt(input) : validateSrt(input);

if (warnings.length > 0) {
  for (const warning of warnings) {
    console.error(`${inputPath}:${warning.line} ${warning.message}`);
  }

  process.exit(1);
}

if (validateOnly) {
  console.log(`${inputPath} looks valid.`);
  process.exit(0);
}

const output =
  direction === "vtt-to-srt"
    ? vttToSrt(input, { preserveCueIds })
    : srtToVtt(input, { preserveCueIds });

await writeFile(outputPath, output, "utf8");
console.log(`Converted ${basename(inputPath)} -> ${outputPath}`);

function consumeFlag(values, flag) {
  const index = values.indexOf(flag);

  if (index === -1) {
    return false;
  }

  values.splice(index, 1);
  return true;
}

function consumeOption(values, flag) {
  const index = values.indexOf(flag);

  if (index === -1) {
    return undefined;
  }

  const value = values[index + 1];

  if (!value || value.startsWith("-")) {
    console.error(`Missing value for ${flag}.`);
    process.exit(1);
  }

  values.splice(index, 2);
  return value;
}

function defaultOutputPath(inputPath, direction) {
  const outputExtension = direction === "vtt-to-srt" ? ".srt" : ".vtt";
  return inputPath.replace(/\.(srt|vtt)$/i, "") + outputExtension;
}

function resolveDirection(inputPath, options) {
  if (options.toFormat) {
    const normalizedFormat = options.toFormat.toLowerCase();

    if (normalizedFormat === "srt") {
      return "vtt-to-srt";
    }

    if (normalizedFormat === "vtt") {
      return "srt-to-vtt";
    }

    console.error(`Unsupported output format: ${options.toFormat}`);
    process.exit(1);
  }

  if (options.reverse) {
    return "vtt-to-srt";
  }

  if (extname(inputPath).toLowerCase() === ".vtt") {
    return "vtt-to-srt";
  }

  return "srt-to-vtt";
}

function printHelp() {
  console.log(`Usage:
  srt-to-vtt input.srt [output.vtt]
  srt-to-vtt input.vtt [output.srt]

Options:
  --preserve-cue-ids  Keep cue identifiers when possible
  --reverse           Convert WebVTT (.vtt) to SubRip (.srt)
  --to srt|vtt        Choose the output format
  --validate          Check the input file without writing output
  -v, --version       Print the package version
  -h, --help          Show this help message

Examples:
  npx @stagecaptions/srt-to-vtt captions.srt captions.vtt
  npx @stagecaptions/srt-to-vtt captions.vtt captions.srt
  npx @stagecaptions/srt-to-vtt captions.srt --validate`);
}
