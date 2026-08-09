# SRT to VTT Converter

[![npm version](https://img.shields.io/npm/v/@stagecaptions/srt-to-vtt)](https://www.npmjs.com/package/@stagecaptions/srt-to-vtt)
[![CI](https://github.com/stagecaptions/srt-to-vtt/actions/workflows/ci.yml/badge.svg)](https://github.com/stagecaptions/srt-to-vtt/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/stagecaptions/srt-to-vtt)](https://github.com/stagecaptions/srt-to-vtt/blob/main/LICENSE)

A command line tool and JavaScript library that converts subtitle files between
SubRip (`.srt`) and WebVTT (`.vtt`) formats.

Built by [StageCaptions](https://stagecaptions.io), browser-based live
captioning software for live events, conferences, and broadcasts.

## Usage

Convert SRT to VTT:

```bash
npx @stagecaptions/srt-to-vtt input.srt output.vtt
```

Convert WebVTT back to SRT:

```bash
npx @stagecaptions/srt-to-vtt input.vtt output.srt
```

## Install

```bash
npm install @stagecaptions/srt-to-vtt
```

## JavaScript API

```js
import { srtToVtt, vttToSrt } from "@stagecaptions/srt-to-vtt";

const vtt = srtToVtt(`1
00:00:01,000 --> 00:00:03,500
Hello world.`);

const srt = vttToSrt(`WEBVTT

00:00:01.000 --> 00:00:03.500
Hello world.`);
```

## Validation

```js
import { validateSrt, validateVtt } from "@stagecaptions/srt-to-vtt";

const srtWarnings = validateSrt(srtText);
const vttWarnings = validateVtt(vttText);
```

## License

MIT
