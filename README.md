# ReWrapped

ReWrapped is a customizable music presentation builder inspired by Spotify
Wrapped. Import your Spotify listening history, define your own awards with
code, and present the results as a polished, shareable story.

> This project is currently in development.

## How It Works

1. Request your extended streaming history from [Spotify's account privacy
   page](https://www.spotify.com/account/privacy/).
2. Download the JSON streaming history files Spotify provides.
3. Import the file into ReWrapped.
4. Configure awards and other slides with your own code.
5. Select **Present** to turn the results into a Spotify Wrapped-style
   presentation.

The presentation model separates imported configuration from computed results.
Award code can work with the imported listening history and return flexible
key-value rows, which can then be displayed using the columns you choose.

## Example Award

An award configuration can look like this:

```ts
{
  type: "award",
  title: "Most Played Artists",
  description: "The artists you listened to most",
  columnsToPresent: ["artist", "minutes"],
  code: `
    result = streamingHistory
      .reduce((totals, entry) => {
        const artist = entry.master_metadata_album_artist_name;
        if (!artist) return totals;

        totals[artist] = (totals[artist] ?? 0) + entry.ms_played;
        return totals;
      }, {})
  `,
}
```

The exact slide execution API is still being developed. The intended result
is a list of rows such as:

```ts
[
  { artist: "OVERWERK", minutes: 842 },
  { artist: "Daft Punk", minutes: 791 },
];
```

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor

## Privacy

Spotify streaming history can contain sensitive information, including
timestamps, device details, country information, and IP addresses. Keep
exported files private and only import them into an application you trust.
