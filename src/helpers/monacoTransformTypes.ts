/*
 * References types in Aggregate.ts and StreamingHistory.ts
 */

export const MONACO_TRANSFORM_TYPES_LIB_URI = "file:///transform-types.d.ts";

export const MONACO_TRANSFORM_TYPES = `
  type AggregateEntity = "title" | "artist" | "album";

  type AggregateBase = {
    entityType: AggregateEntity;
    entityKey: string;
    entityName: string;
    artist: string | null;
    album: string | null;
  };

  type YearlyAggregate = AggregateBase & {
    year: number;
    listens: number;
    listensOver60s: number;
    skips: number;
    skipPct: number;
    averageMsPlayed: number;
    durationMs: number | null;
    progressPct: number | null;
    skipProgressPct: number | null;
    uniqueTracks: number;
    eligibleTracks: number;
  };

  type HalfYearAggregate = AggregateBase & {
    year: number;
    H1_listens: number;
    H2_listens: number;
    H1_skip_pct: number | null;
    H2_skip_pct: number | null;
    delta_listens: number;
    delta_skip_pct: number | null;
    pct_change_listens: number | null;
  };

  type QuarterlyAggregate = AggregateBase & {
    year: number;
    Q1_listens: number;
    Q2_listens: number;
    Q3_listens: number;
    Q4_listens: number;
    Q1_skip_pct: number | null;
    Q2_skip_pct: number | null;
    Q3_skip_pct: number | null;
    Q4_skip_pct: number | null;
    mean_skip_pct: number | null;
    sd_skip_pct: number | null;
  };

  type YearOverYearAggregate = AggregateBase & {
    year: string;
    listensPrevious: number;
    listensCurrent: number;
    deltaListens: number;
    pctChangeListens: number | null;
    skipPctPrevious: number | null;
    skipPctCurrent: number;
    deltaSkipPct: number | null;
  };

  type StreamingHistory = {
    ts: string;
    platform: string;
    msPlayed: number;
    title: string | null;
    artist: string | null;
    album: string | null;
    track_id: string;
    reason_start: string | null;
    reason_end: string | null;
    shuffle: boolean | null;
    skipped: boolean | null;
    incognito_mode: boolean | null;
  };

  declare const global: {
    yearlyAggregate?: YearlyAggregate[];
    halfAggregate?: HalfYearAggregate[];
    quarterlyAggregate?: QuarterlyAggregate[];
    yearOverYearAggregate?: YearOverYearAggregate[];
  };

  declare const streamingHistory: StreamingHistory[];
`;

export const registerMonacoTransformTypes = (monaco: any) => {
  const extraLibs =
    monaco?.languages?.typescript?.javascriptDefaults?.getExtraLibs?.() ?? {};

  if (extraLibs[MONACO_TRANSFORM_TYPES_LIB_URI]) {
    return;
  }

  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    MONACO_TRANSFORM_TYPES,
    MONACO_TRANSFORM_TYPES_LIB_URI,
  );
};
