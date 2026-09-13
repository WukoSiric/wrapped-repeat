import type { TrackId } from "./StreamingHistory";

export type PresentationConfiguration = {
  id: string;
  slides: SlideConfiguration[];
  excludedTracks: TrackId[];
};

export const SlideType = {
  song: "song",
  artist: "artist",
  album: "album",
  transition: "transition",
} as const;

export type SlideType = (typeof SlideType)[keyof typeof SlideType];

export type SlideConfiguration = {
  id: string;
  type: SlideType;
  title: string;
  description: string;
  image?: string;
};

export type AwardSlideConfiguration = SlideConfiguration & {
  type: Omit<SlideType, typeof SlideType.transition>;
  code: string;
  manualOverrides: number[];
  columnsToPresent: string[];
};

export type TransitionSlideConfiguration = SlideConfiguration & {
  messages: string[];
};
