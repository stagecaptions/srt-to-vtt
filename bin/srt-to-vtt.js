#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { srtToVtt, validateSrt } from "../src/index.js";

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

const [inputPath, outputPath = defaultOutputPath(positional[0])] = positional;
const input = await readFile(inputPath, "utf8");
const warnings = validateSrt(input);

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

await writeFile(outputPath, srtToVtt(input, { preserveCueIds }), "utf8");
console.log(`Converted ${basename(inputPath)} -> ${outputPath}`);

function consumeFlag(values, flag) {
  const index = values.indexOf(flag);

  if (index === -1) {
    return false;
  }

  values.splice(index, 1);
  return true;
}

function defaultOutputPath(inputPath) {
  return inputPath.replace(/\.srt$/i, "") + ".vtt";
}

function printHelp() {
  console.log(`Usage:
  srt-to-vtt input.srt [output.vtt]

Options:
  --preserve-cue-ids  Keep SRT cue numbers as WebVTT cue identifiers
  --validate          Check the input file without writing output
  -v, --version       Print the package version
  -h, --help          Show this help message

Examples:
  npx @stagecaptions/srt-to-vtt captions.srt captions.vtt
  npx @stagecaptions/srt-to-vtt captions.srt --validate`);
}
