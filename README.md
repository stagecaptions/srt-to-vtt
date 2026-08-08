# SRT to VTT Converter

A command line tool and JavaScript library that converts subtitle files from
SubRip (`.srt`) format to WebVTT (`.vtt`) format.

Built by [StageCaptions](https://stagecaptions.io), browser-based live
captioning software for live events, conferences, and broadcasts.

## Features

- Converts `.srt` subtitle files to browser-friendly `.vtt` files
- Works as a CLI, Node.js library, and browser-compatible JavaScript module
- Runs offline with no external dependencies
- Normalizes SRT timestamps from `00:00:01,000` to `00:00:01.000`
- Handles UTF-8 BOM files, CRLF line endings, and multiline subtitle cues
- Includes a small validator for malformed timestamp lines

## Usage

Run it directly with `npx`:

```bash
npx @stagecaptions/srt-to-vtt input.srt output.vtt
```

If you omit the output file, the converter writes next to the input file:

```bash
npx @stagecaptions/srt-to-vtt captions.srt
```

This creates:

```txt
captions.vtt
```

Validate an SRT file without writing output:

```bash
npx @stagecaptions/srt-to-vtt captions.srt --validate
```

Preserve SRT cue numbers as WebVTT cue identifiers:

```bash
npx @stagecaptions/srt-to-vtt captions.srt captions.vtt --preserve-cue-ids
```

## Install

```bash
npm install @stagecaptions/srt-to-vtt
```

## JavaScript API

```js
import { srtToVtt } from "@stagecaptions/srt-to-vtt";

const vtt = srtToVtt(`1
00:00:01,000 --> 00:00:03,500
Hello world.`);

console.log(vtt);
```

Output:

```vtt
WEBVTT

00:00:01.000 --> 00:00:03.500
Hello world.
```

## Validation

```js
import { validateSrt } from "@stagecaptions/srt-to-vtt";

const warnings = validateSrt(srtText);
```

`validateSrt` returns an array of warnings:

```js
[
  {
    line: 2,
    message: "Invalid timestamp line. Expected HH:MM:SS,mmm --> HH:MM:SS,mmm."
  }
]
```

## License

MIT
