# League of Legends Showcase API & Discord Bot

A TypeScript backend that links Discord users to their **League of Legends** accounts. It pulls their match history from the **Riot Games API** and turns it into stats and a monthly **server leaderboard**, through Discord slash commands and a small REST API.

Built with **Node.js, Express, TypeScript, Prisma (MySQL) and discord.js v14**.

---

## Features

- **Account linking:** `/link Name#TAG` resolves the player's Riot ID to a PUUID and links it to their Discord user and server.
- **Match ingestion:** fetches the current month's matches from Riot's Match-V5 API, skips ones already stored, and saves match and per-player data (around 70 stats per participant) in MySQL.
- **Player stats:** `/stats` shows win rate, KDA, vision, damage, CS, gold, game length and multikills for the last 20 games in a chosen queue.
- **Server leaderboard:** `/leaderboard` refreshes everyone's matches and ranks the server's players by a weighted monthly score from Ranked Solo/Duo and Flex games. It also shows how each player moved since the last run.
- **REST API:** endpoints for a player's recent match history and ranked Solo/Flex data, with rank icons.
- **Data retention:** matches older than two months are cleaned up automatically after each update.
- **Rate-limit friendly:** requests to Riot are spaced out to stay within personal API key limits.

---

## Tech stack

| Area | Tools |
| --- | --- |
| Runtime & language | Node.js, TypeScript |
| API | Express, Helmet, CORS |
| Database | MySQL with Prisma ORM (schema + migrations in `prisma/`) |
| Discord | discord.js v14 (slash commands, embeds) |
| External APIs | Riot Games API: Account-V1, Match-V5, League-V4 (via Axios) |
| Tooling | ts-node-dev, TSLint |

---

## Project structure

```
prisma/
  schema.prisma          # users, discords, matches, participants, queue types, leaderboards
  migrations/
src/
  index.ts               # Express app + starts the Discord bot
  routes/
    user/user.ts         # /v1/user/matchhistory, /v1/user/rankstats
    auth/auth.ts         # JWT auth routes (currently disabled)
  discordBot/
    index.ts             # bot client, command loader and slash-command registration
    commands/utility/    # link, stats, update, leaderboard
  db/index.ts            # Prisma queries
  utils/
    lol_api.ts           # Riot API client and match ingestion
    lolStats.ts          # stat calculations
  middleware/            # error and 404 handlers
rest/                    # example requests (VS Code REST Client)
```

---

## Getting started

### Prerequisites

- **Node.js** 18+ and npm
- A **MySQL** server
- A **Riot Games API key** from the [Riot Developer Portal](https://developer.riotgames.com/)
- A **Discord application and bot** from the [Discord Developer Portal](https://discord.com/developers/applications), invited to your server with the `applications.commands` and `bot` scopes

### 1. Install

```sh
git clone https://github.com/LegendDRD/League-of-Legends-Showcase-API.git
cd League-of-Legends-Showcase-API
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=3004
MODE=DEV                      # DEV adds status-code descriptions to responses

# Database
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/lol_showcase"

# Riot Games API
LOL_API_KEY=RGAPI-xxxxxxxx
LOL_URL=https://europe.api.riotgames.com        # regional routing (Account-V1, Match-V5)
LOL_URL_LEAGUE=https://euw1.api.riotgames.com   # platform routing (League-V4)

# Discord bot
CLIENT_TOKEN=your-bot-token
CLIENT_ID=your-application-id
GUILD_ID=your-server-id      # slash commands are registered to this server

# Optional
ACCESS_TOKEN_SECRET=change-me
FILE_LEVEL=critical
EMAIL_LEVEL=critical
```

Change `LOL_URL` and `LOL_URL_LEAGUE` to match your players' region (e.g. `americas` / `na1`).

### 3. Set up the database

```sh
npx prisma db push      # create the tables from the schema
npx prisma generate     # generate the Prisma client
```

### 4. Run

```sh
# Production build (API + Discord bot with slash commands)
npm run build
npm start

# Development (auto-restart on changes)
npm run dev
```

Both modes start the REST API and the Discord bot, and register the slash commands for the server set in `GUILD_ID`.

---

## Discord commands

| Command | Description |
| --- | --- |
| `/link username:Name#TAG` | Link your Discord account to your League of Legends account and import your matches for this month |
| `/stats type:<Solo \| Flex \| Normal \| Aram>` | Show your stats for the last 20 games in that queue |
| `/update` | Refresh match data for every linked player in the server |
| `/leaderboard` | Refresh everyone's matches and post the monthly ranked leaderboard |

### How the leaderboard score works

Each Ranked Solo/Duo and Flex match this month is scored on kills, deaths, assists, first blood and vision score:

- **Wins** are weighted by the player's win rate so far that month, which rewards consistency.
- **Losses** reduce the score.
- **Surrendered losses** count more heavily.

The match scores are added up for the month. Players are sorted by score, and the embed shows each player's change in position since the previous leaderboard.

---

## REST API

Base URL: `http://localhost:<PORT>/v1`

| Method | Endpoint | Body | Returns |
| --- | --- | --- | --- |
| `POST` | `/user/matchhistory` | `{ "userName": "Name", "tagLine": "TAG" }` | Last 20 stored matches: champion, result, lane, K/D/A, KDA, gold, damage, vision, queue type |
| `POST` | `/user/rankstats` | `{ "userName": "Name", "tagLine": "TAG" }` | Ranked Solo/Duo and Flex entries (tier, rank, LP, wins/losses) with a rank icon URL |

The player must have been linked through the bot first. Example requests are in `rest/user.rest`.

---

## Known limitations & roadmap

- JWT authentication routes are written but currently disabled.
- Leaderboard history is kept in memory. The `historical_leaderboards` table is ready for saving it.
- Riot is moving its endpoints from summoner IDs to PUUIDs, so the ranked lookup may need updating.
- Planned: tests, a web front end for the showcase, and scheduled background match syncing.

---

## License

[MIT](LICENSE) © 2024 Damian Dowie

---

## Disclaimer

This project isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
