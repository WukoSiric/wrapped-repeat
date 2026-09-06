export type StreamingHistoryJson = {
  /** ISO 8601 timestamp for when playback started. */
  ts: string;
  /** Device or operating system used for playback. */
  platform: string;
  /** Playback duration in milliseconds. */
  ms_played: number;
  /** Two-letter country code associated with the connection. */
  conn_country: string;
  /** IP address recorded for the playback session. */
  ip_addr: string;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  /** Spotify URI for the played track. */
  spotify_track_uri: string | null;
  episode_name: string | null;
  episode_show_name: string | null;
  /** Spotify URI for the played episode. */
  spotify_episode_uri: string | null;
  audiobook_title: string | null;
  audiobook_uri: string | null;
  audiobook_chapter_uri: string | null;
  audiobook_chapter_title: string | null;
  /** Reason playback started, such as trackdone or clickrow. */
  reason_start: string | null;
  /** Reason playback ended, such as trackdone, logout, or endplay. */
  reason_end: string | null;
  shuffle: boolean | null;
  skipped: boolean | null;
  /** Whether playback occurred without an internet connection. */
  offline: boolean | null;
  /** Unix timestamp for when offline playback occurred, in milliseconds. */
  offline_timestamp: number | null;
  incognito_mode: boolean | null;
};
