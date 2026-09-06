export type PresentationConfiguration = {
  slides: SlideConfiguration[];
};

export type SlideConfiguration =
  | {
      type: "award";
      title: string;
      description: string;
      columnsToPresent: string[];
      code: string;
    }
  | {
      type: "transition";
      title: string;
      description: string;
      image: string;
    };

export type PresentationResult = {
  slides: SlideResult[];
};

export type SlideResult = {
  type: "award" | "transition" | "custom";
  title: string;
  description: string;
  columnsToPresent?: string[];
  results: Result[];
};

export type Result = Record<string, ResultValue>;
export type ResultValue = string | number;
