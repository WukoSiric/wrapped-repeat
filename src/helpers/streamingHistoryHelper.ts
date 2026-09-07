import type {
  StreamingHistory,
  StreamingHistoryJson,
  TrackId,
} from "../types/StreamingHistory";

export const createTrackId = (
  title: string | null,
  artist: string | null,
): TrackId => `${title}__${artist}`;

export const importStreamingHistory = (
  json: StreamingHistoryJson[],
): StreamingHistory[] =>
  json.map((entry) => ({
    ts: entry.ts,
    platform: entry.platform,
    msPlayed: entry.ms_played,
    title: entry.master_metadata_track_name,
    artist: entry.master_metadata_album_artist_name,
    album: entry.master_metadata_album_album_name,
    track_id: createTrackId(
      entry.master_metadata_track_name,
      entry.master_metadata_album_artist_name,
    ),
    reason_start: entry.reason_start,
    reason_end: entry.reason_end,
    shuffle: entry.shuffle,
    skipped: entry.skipped,
    incognito_mode: entry.incognito_mode,
  }));
