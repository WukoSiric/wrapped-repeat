import type { SlideType } from "./PresentationConfiguration";
// TODO: Think more about presentation type
export type PresentationResult = {
  slides: SlideResult[];
};

export type SlideResult = {
  type: SlideType;
  title: string;
  description: string;

  results: Result[];

  columnsToPresent: string[];
  manualOverrides: number[];
};

export type Result = Record<string, ResultValue>;
export type ResultValue = string | number | object | [];
