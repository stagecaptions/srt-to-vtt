export interface SrtToVttOptions {
  preserveCueIds?: boolean;
}

export interface VttToSrtOptions {
  preserveCueIds?: boolean;
}

export interface SrtValidationWarning {
  code: "invalid-timestamp" | "no-cues";
  line: number;
  message: string;
}

export interface VttValidationWarning {
  code: "invalid-timestamp" | "no-cues";
  line: number;
  message: string;
}

export function srtToVtt(input: string, options?: SrtToVttOptions): string;

export function validateSrt(input: string): SrtValidationWarning[];

export function vttToSrt(input: string, options?: VttToSrtOptions): string;

export function validateVtt(input: string): VttValidationWarning[];
