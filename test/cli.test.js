import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL("../bin/srt-to-vtt.js", import.meta.url));

describe("srt-to-vtt CLI", () => {
  it("converts an input file to an output file", async () => {
    const directory = await mkdtemp(join(tmpdir(), "srt-to-vtt-"));

    try {
      const inputPath = join(directory, "captions.srt");
      const outputPath = join(directory, "captions.vtt");
      const input = `1
00:00:01,000 --> 00:00:02,000
Hello`;

      await writeFile(inputPath, input, "utf8");

      const { stdout } = await execFileAsync(process.execPath, [
        cliPath,
        inputPath,
        outputPath,
      ]);
      const output = await readFile(outputPath, "utf8");

      assert.match(stdout, /Converted captions\.srt -> /);
      assert.equal(
        output,
        `WEBVTT

00:00:01.000 --> 00:00:02.000
Hello
`,
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("converts a VTT input file to SRT", async () => {
    const directory = await mkdtemp(join(tmpdir(), "srt-to-vtt-"));

    try {
      const inputPath = join(directory, "captions.vtt");
      const outputPath = join(directory, "captions.srt");
      const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
Hello`;

      await writeFile(inputPath, input, "utf8");

      const { stdout } = await execFileAsync(process.execPath, [
        cliPath,
        inputPath,
        outputPath,
      ]);
      const output = await readFile(outputPath, "utf8");

      assert.match(stdout, /Converted captions\.vtt -> /);
      assert.equal(
        output,
        `1
00:00:01,000 --> 00:00:02,000
Hello
`,
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("supports explicit output format selection", async () => {
    const directory = await mkdtemp(join(tmpdir(), "srt-to-vtt-"));

    try {
      const inputPath = join(directory, "captions.txt");
      const outputPath = join(directory, "captions.srt");
      const input = `WEBVTT

00:00:01.000 --> 00:00:02.000
Hello`;

      await writeFile(inputPath, input, "utf8");

      await execFileAsync(process.execPath, [
        cliPath,
        inputPath,
        outputPath,
        "--to",
        "srt",
      ]);
      const output = await readFile(outputPath, "utf8");

      assert.equal(
        output,
        `1
00:00:01,000 --> 00:00:02,000
Hello
`,
      );
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });

  it("exits non-zero for unknown options", async () => {
    await assert.rejects(
      execFileAsync(process.execPath, [cliPath, "--unknown"]),
      error => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, /Unknown option: --unknown/);
        return true;
      },
    );
  });

  it("exits non-zero and does not write output for invalid SRT", async () => {
    const directory = await mkdtemp(join(tmpdir(), "srt-to-vtt-"));

    try {
      const inputPath = join(directory, "captions.srt");
      const outputPath = join(directory, "captions.vtt");
      const input = `1
00:00:01 --> 00:00:02
Hello`;

      await writeFile(inputPath, input, "utf8");

      await assert.rejects(
        execFileAsync(process.execPath, [cliPath, inputPath, outputPath]),
        error => {
          assert.equal(error.code, 1);
          assert.match(error.stderr, /Invalid timestamp line/);
          return true;
        },
      );
      await assert.rejects(access(outputPath));
    } finally {
      await rm(directory, { force: true, recursive: true });
    }
  });
});
