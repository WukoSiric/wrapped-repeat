export type AggregateEntity = "title" | "artist" | "album";

export type AggregateBase = {
  entityType: AggregateEntity;
  entityKey: string;
  entityName: string;
  artist: string | null;
  album: string | null;
};

export type YearlyAggregate = AggregateBase & {
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

export type HalfYearAggregate = AggregateBase & {
  year: number;
  H1_listens: number;
  H2_listens: number;
  H1_skip_pct: number | null;
  H2_skip_pct: number | null;
  delta_listens: number;
  delta_skip_pct: number | null;
  pct_change_listens: number | null;
};

export type QuarterlyAggregate = AggregateBase & {
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

export type YearOverYearAggregate = AggregateBase & {
  year: string;
  listensPrevious: number;
  listensCurrent: number;
  deltaListens: number;
  pctChangeListens: number | null;
  skipPctPrevious: number | null;
  skipPctCurrent: number;
  deltaSkipPct: number | null;
};
