export type PresentationConfiguration = {
  slides: SlideConfiguration[];
};

export const SlideType = {
  song: "song",
  artist: "artist",
  album: "album",
  transition: "transition",
} as const;

export type SlideType = (typeof SlideType)[keyof typeof SlideType];

export type SlideConfiguration = {
  type: SlideType;
  title: string;
  description: string;
  image?: string;
};

export type AwardSlideConfiguration = SlideConfiguration & {
  type: Omit<SlideType, typeof SlideType.transition>;
  code: string;
  columnsToPresent: string[];
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

export type GlobalVariable = Object;
