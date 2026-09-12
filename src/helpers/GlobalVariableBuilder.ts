import type { StreamingHistory } from "../types/StreamingHistory";
import type {
  AggregateEntity,
  HalfYearAggregate,
  QuarterlyAggregate,
  YearOverYearAggregate,
  YearlyAggregate,
} from "../types/Aggregate";

type InternalYearlyAggregate = {
  year: number;
  entityType: AggregateEntity;
  entityKey: string;
  entityName: string;
  artist: string | null;
  album: string | null;
  listens: number;
  listensOver60s: number;
  skips: number;
  totalMsPlayed: number;
  durationCandidates: number[];
  entries: Array<{ msPlayed: number; skipped: boolean }>;
  trackCounts: Map<string, number>;
};

type InternalPeriodAggregate = {
  year: number;
  entityType: AggregateEntity;
  entityKey: string;
  entityName: string;
  artist: string | null;
  album: string | null;
  half?: "H1" | "H2";
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  listens: number;
  skipCount: number;
};

const getYear = (ts: string): number => {
  const date = new Date(ts);

  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return date.getUTCFullYear();
};

const getHalf = (ts: string): "H1" | "H2" => {
  const date = new Date(ts);
  const month = Number.isNaN(date.getTime()) ? 0 : date.getUTCMonth() + 1;

  return month <= 6 ? "H1" : "H2";
};

const getQuarter = (ts: string): "Q1" | "Q2" | "Q3" | "Q4" => {
  const date = new Date(ts);
  const month = Number.isNaN(date.getTime()) ? 0 : date.getUTCMonth() + 1;

  if (month <= 3) {
    return "Q1";
  }

  if (month <= 6) {
    return "Q2";
  }

  if (month <= 9) {
    return "Q3";
  }

  return "Q4";
};

const getEntityMeta = (
  entry: StreamingHistory,
  entityType: AggregateEntity,
) => {
  const entityKey =
    entityType === "title"
      ? String(entry.title ?? entry.track_id ?? "Unknown title")
      : entityType === "artist"
        ? String(entry.artist ?? "Unknown artist")
        : String(entry.album ?? "Unknown album");

  return {
    entityKey,
    entityName: entityKey,
    artist: entry.artist,
    album: entry.album,
  };
};

const toNullableNumber = (value: number | null): number | null => value;

export type GlobalVariableBuilderResult = StreamingHistory[] & {
  yearlyAggregate?: YearlyAggregate[];
  halfAggregate?: HalfYearAggregate[];
  quarterlyAggregate?: QuarterlyAggregate[];
  yearOverYearAggregate?: YearOverYearAggregate[];
};

export class GlobalVariableBuilder {
  private readonly history: GlobalVariableBuilderResult;
  private readonly entityType: AggregateEntity;

  constructor(
    history: StreamingHistory[],
    entityType: AggregateEntity = "title",
  ) {
    this.history = history as GlobalVariableBuilderResult;
    this.entityType = entityType;
  }

  addYearlyAggregate(): this {
    this.buildYearlyAggregate();

    return this;
  }

  addHalfAggregate(): this {
    this.buildHalfYearAggregate();

    return this;
  }

  addHalfYearAggregate(): this {
    return this.addHalfAggregate();
  }

  addQuarterlyAggregate(): this {
    this.buildQuarterlyAggregate();

    return this;
  }

  addYearOverYearAggregate(): this {
    this.buildYearOverYearAggregate();

    return this;
  }

  build(): GlobalVariableBuilderResult {
    return this.history;
  }

  private buildYearlyAggregate(): GlobalVariableBuilderResult {
    const rows = new Map<string, InternalYearlyAggregate>();

    for (const entry of this.history) {
      const { entityKey, entityName, artist, album } = getEntityMeta(
        entry,
        this.entityType,
      );
      const year = getYear(entry.ts);
      const rowKey = `${year}::${this.entityType}::${entityKey}`;

      const row = rows.get(rowKey) ?? {
        year,
        entityType: this.entityType,
        entityKey,
        entityName,
        artist,
        album,
        listens: 0,
        listensOver60s: 0,
        skips: 0,
        totalMsPlayed: 0,
        durationCandidates: [],
        entries: [],
        trackCounts: new Map<string, number>(),
      };

      if (!rows.has(rowKey)) {
        rows.set(rowKey, row);
      }

      row.listens += 1;
      row.totalMsPlayed += entry.msPlayed;

      if (entry.msPlayed >= 60000) {
        row.listensOver60s += 1;
      }

      if (entry.skipped) {
        row.skips += 1;
      }

      if (entry.reason_end === "trackdone" && !entry.skipped) {
        row.durationCandidates.push(entry.msPlayed);
      }

      row.entries.push({
        msPlayed: entry.msPlayed,
        skipped: Boolean(entry.skipped),
      });

      const trackId = String(
        entry.track_id ??
          `${entry.title ?? "unknown_title"}__${entry.artist ?? "unknown_artist"}`,
      );

      row.trackCounts.set(trackId, (row.trackCounts.get(trackId) ?? 0) + 1);
    }

    const yearlyAggregate = Array.from(rows.values())
      .map((row) => {
        const durationMs =
          row.durationCandidates.length > 0
            ? Math.max(...row.durationCandidates)
            : null;

        const averageMsPlayed =
          row.listens > 0 ? row.totalMsPlayed / row.listens : 0;

        const progressPct =
          durationMs !== null && row.entries.length > 0
            ? row.entries.reduce(
                (sum, entry) => sum + entry.msPlayed / durationMs,
                0,
              ) / row.entries.length
            : null;

        const skippedEntries = row.entries.filter((entry) => entry.skipped);
        const skipProgressPct =
          durationMs !== null && skippedEntries.length > 0
            ? skippedEntries.reduce(
                (sum, entry) => sum + entry.msPlayed / durationMs,
                0,
              ) / skippedEntries.length
            : null;

        const uniqueTracks = row.trackCounts.size;
        const eligibleTracks = Array.from(row.trackCounts.values()).filter(
          (count) => count >= 3,
        ).length;

        return {
          year: row.year,
          entityType: row.entityType,
          entityKey: row.entityKey,
          entityName: row.entityName,
          artist: row.artist,
          album: row.album,
          listens: row.listens,
          listensOver60s: row.listensOver60s,
          skips: row.skips,
          skipPct: row.listens > 0 ? row.skips / row.listens : 0,
          averageMsPlayed,
          durationMs,
          progressPct,
          skipProgressPct,
          uniqueTracks,
          eligibleTracks,
        } satisfies YearlyAggregate;
      })
      .sort((first, second) => {
        if (first.year !== second.year) {
          return first.year - second.year;
        }

        return first.entityName.localeCompare(second.entityName);
      });

    this.history.yearlyAggregate = yearlyAggregate;

    return this.history;
  }

  private buildPeriodAggregate(
    period: "half" | "quarter",
  ): GlobalVariableBuilderResult {
    const periodMap = new Map<string, InternalPeriodAggregate>();

    for (const entry of this.history) {
      const { entityKey, entityName, artist, album } = getEntityMeta(
        entry,
        this.entityType,
      );
      const year = getYear(entry.ts);
      const half = getHalf(entry.ts);
      const quarter = getQuarter(entry.ts);

      const periodSuffix = period === "half" ? half : quarter;
      const aggregateKey = `${year}::${this.entityType}::${entityKey}::${periodSuffix}`;

      const aggregate: InternalPeriodAggregate = periodMap.get(
        aggregateKey,
      ) ?? {
        year,
        entityType: this.entityType,
        entityKey,
        entityName,
        artist,
        album,
        listens: 0,
        skipCount: 0,
      };

      if (!periodMap.has(aggregateKey)) {
        periodMap.set(aggregateKey, aggregate);
      }

      if (period === "half") {
        aggregate.half = half;
      } else {
        aggregate.quarter = quarter;
      }

      aggregate.listens += 1;
      aggregate.skipCount += entry.skipped ? 1 : 0;
    }

    const rows = new Map<
      string,
      {
        year: number;
        entityType: AggregateEntity;
        entityKey: string;
        entityName: string;
        artist: string | null;
        album: string | null;
        H1_listens?: number;
        H2_listens?: number;
        H1_skip_pct?: number | null;
        H2_skip_pct?: number | null;
        Q1_listens?: number;
        Q2_listens?: number;
        Q3_listens?: number;
        Q4_listens?: number;
        Q1_skip_pct?: number | null;
        Q2_skip_pct?: number | null;
        Q3_skip_pct?: number | null;
        Q4_skip_pct?: number | null;
      }
    >();

    for (const periodAggregate of periodMap.values()) {
      const rowKey = `${periodAggregate.year}::${periodAggregate.entityType}::${periodAggregate.entityKey}`;

      let row = rows.get(rowKey);

      if (!row) {
        row = {
          year: periodAggregate.year,
          entityType: periodAggregate.entityType,
          entityKey: periodAggregate.entityKey,
          entityName: periodAggregate.entityName,
          artist: periodAggregate.artist,
          album: periodAggregate.album,
        };

        rows.set(rowKey, row);
      }

      if (period === "half") {
        const half = periodAggregate.half as "H1" | "H2";
        const listensKey = `${half}_listens` as const;
        const skipKey = `${half}_skip_pct` as const;

        row[listensKey] = periodAggregate.listens;
        row[skipKey] =
          periodAggregate.listens > 0
            ? periodAggregate.skipCount / periodAggregate.listens
            : null;
      } else {
        const quarter = periodAggregate.quarter as "Q1" | "Q2" | "Q3" | "Q4";
        const listensKey = `${quarter}_listens` as const;
        const skipKey = `${quarter}_skip_pct` as const;

        row[listensKey] = periodAggregate.listens;
        row[skipKey] =
          periodAggregate.listens > 0
            ? periodAggregate.skipCount / periodAggregate.listens
            : null;
      }
    }

    if (period === "half") {
      const halfAggregate = Array.from(rows.values())
        .map((row) => {
          const H1_listens = row.H1_listens ?? 0;
          const H2_listens = row.H2_listens ?? 0;
          const H1_skip_pct = row.H1_skip_pct ?? null;
          const H2_skip_pct = row.H2_skip_pct ?? null;

          const delta_listens = H2_listens - H1_listens;
          const delta_skip_pct =
            H1_skip_pct !== null && H2_skip_pct !== null
              ? H2_skip_pct - H1_skip_pct
              : null;

          const pct_change_listens =
            H1_listens > 0 ? delta_listens / H1_listens : null;

          return {
            year: row.year,
            entityType: row.entityType,
            entityKey: row.entityKey,
            entityName: row.entityName,
            artist: row.artist,
            album: row.album,
            H1_listens,
            H2_listens,
            H1_skip_pct,
            H2_skip_pct,
            delta_listens,
            delta_skip_pct,
            pct_change_listens,
          } satisfies HalfYearAggregate;
        })
        .sort((first, second) => {
          if (first.year !== second.year) {
            return first.year - second.year;
          }

          return first.entityName.localeCompare(second.entityName);
        });

      this.history.halfAggregate = halfAggregate;

      return this.history;
    }

    const quarterlyAggregate = Array.from(rows.values())
      .map((row) => {
        const quarterlyValues = [
          row.Q1_skip_pct,
          row.Q2_skip_pct,
          row.Q3_skip_pct,
          row.Q4_skip_pct,
        ].filter((value) => value !== null && value !== undefined);

        const mean_skip_pct =
          quarterlyValues.length > 0
            ? quarterlyValues.reduce((sum, value) => sum + value, 0) /
              quarterlyValues.length
            : null;

        const sd_skip_pct =
          quarterlyValues.length > 1
            ? Math.sqrt(
                quarterlyValues.reduce(
                  (sum, value) => sum + (value - (mean_skip_pct ?? 0)) ** 2,
                  0,
                ) /
                  (quarterlyValues.length - 1),
              )
            : null;

        return {
          year: row.year,
          entityType: row.entityType,
          entityKey: row.entityKey,
          entityName: row.entityName,
          artist: row.artist,
          album: row.album,
          Q1_listens: row.Q1_listens ?? 0,
          Q2_listens: row.Q2_listens ?? 0,
          Q3_listens: row.Q3_listens ?? 0,
          Q4_listens: row.Q4_listens ?? 0,
          Q1_skip_pct: toNullableNumber(row.Q1_skip_pct ?? null),
          Q2_skip_pct: toNullableNumber(row.Q2_skip_pct ?? null),
          Q3_skip_pct: toNullableNumber(row.Q3_skip_pct ?? null),
          Q4_skip_pct: toNullableNumber(row.Q4_skip_pct ?? null),
          mean_skip_pct,
          sd_skip_pct,
        } satisfies QuarterlyAggregate;
      })
      .sort((first, second) => {
        if (first.year !== second.year) {
          return first.year - second.year;
        }

        return first.entityName.localeCompare(second.entityName);
      });

    this.history.quarterlyAggregate = quarterlyAggregate;

    return this.history;
  }

  private buildHalfYearAggregate(): GlobalVariableBuilderResult {
    return this.buildPeriodAggregate("half");
  }

  private buildQuarterlyAggregate(): GlobalVariableBuilderResult {
    return this.buildPeriodAggregate("quarter");
  }

  private buildYearOverYearAggregate(): GlobalVariableBuilderResult {
    const yearlyRows =
      this.history.yearlyAggregate ??
      this.buildYearlyAggregate().yearlyAggregate ??
      [];

    const rowsByEntity = new Map<string, YearlyAggregate[]>();

    for (const row of yearlyRows) {
      const entityKey = `${row.entityType}::${row.entityKey}`;
      const existing = rowsByEntity.get(entityKey) ?? [];

      existing.push(row);
      rowsByEntity.set(entityKey, existing);
    }

    const results: YearOverYearAggregate[] = [];

    for (const rows of rowsByEntity.values()) {
      const sortedRows = rows.sort((first, second) => first.year - second.year);

      for (let index = 1; index < sortedRows.length; index += 1) {
        const previous = sortedRows[index - 1];
        const current = sortedRows[index];
        const deltaListens = current.listens - previous.listens;
        const pctChangeListens =
          previous.listens > 0 ? deltaListens / previous.listens : null;

        results.push({
          year: `${previous.year}/${current.year}`,
          entityType: current.entityType,
          entityKey: current.entityKey,
          entityName: current.entityName,
          artist: current.artist,
          album: current.album,
          listensPrevious: previous.listens,
          listensCurrent: current.listens,
          deltaListens,
          pctChangeListens,
          skipPctPrevious: previous.skipPct,
          skipPctCurrent: current.skipPct,
          deltaSkipPct: current.skipPct - previous.skipPct,
        });
      }
    }

    const yearOverYearAggregate = results.sort((first, second) => {
      if (first.entityName !== second.entityName) {
        return first.entityName.localeCompare(second.entityName);
      }

      return first.year.localeCompare(second.year);
    });

    this.history.yearOverYearAggregate = yearOverYearAggregate;

    return this.history;
  }
}
