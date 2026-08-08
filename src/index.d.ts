export interface SrtToVttOptions {
  preserveCueIds?: boolean;
}

export interface SrtValidationWarning {
  code: "invalid-timestamp" | "no-cues";
  line: number;
  message: string;
}

export function srtToVtt(input: string, options?: SrtToVttOptions): string;

export function validateSrt(input: string): SrtValidationWarning[];
