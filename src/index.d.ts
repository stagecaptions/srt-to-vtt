export interface SrtToVttOptions {
  preserveCueIds?: boolean;
}

export interface SrtValidationWarning {
  line: number;
  message: string;
}

export function srtToVtt(input: string, options?: SrtToVttOptions): string;

export function validateSrt(input: string): SrtValidationWarning[];
