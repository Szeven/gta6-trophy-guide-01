[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Szeven/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Szeven/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# GTA VI Trophy Guide — Platinum Road

An offline web app that is the best guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI. It opens in a desktop browser with the network
off, tracks your progress on the official trophy list, and walks you to the
platinum one trophy at a time.

## What it does

- **The full official list.** All 55 trophies with their official name,
  description and grade: 1 platinum, 2 gold, 6 silver, 46 bronze. Nothing
  invented, nothing left out.
- **A real guide for every trophy, in our own words.** What to do, where and
  how, and when it can be missed. Where the official description does not pin
  a place down, the guide says so plainly instead of guessing.
- **A roadmap to the platinum.** Ordered phases from the first mission to the
  final cleanup, with an estimate of how long each phase takes.
- **Missables flagged.** Every trophy that can be missed is marked, with the
  exact moment it can slip past you and how to avoid that.
- **A tracker that remembers.** Tick trophies off and your progress is saved
  in the browser. Export it, import it on another machine, and pick up where
  you left off.
- **Filters, search and a spoiler setting.** Filter by grade, by kind
  (story, exploration, combat, driving, collectibles, activities, money and
  misc), or search by name. The spoiler setting hides story trophies until
  you have earned them.
- **A Next up planner.** It looks at what you have earned and suggests the
  next trophies to chase, so you always know what to do next.
- **Notes.** Write a note on any trophy — a location, a loadout, a reminder —
  and it is saved with your progress.
- **Dark and light themes.** Paper by day, night by night.

## Confirmed vs our advice

The trophy names, descriptions and grades are the official PlayStation 5
list, frozen on 2026-11-18 (sources: the official list on Exophase and
PSNProfiles). The guide text is our own advice built from those official
descriptions, not yet checked in the game — the game had not been played by
us when this guide was written, and the guide says so where it matters. No
Rockstar logo or official artwork appears anywhere in this guide.

## Run it

```sh
node serve.ts            # serves app/ on http://localhost:8080
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network: the app loads nothing from outside itself.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library.

## Layout

- `app/index.html` — the guide's shell and all its pages.
- `app/style.css` — the look: paper and night themes.
- `app/app.js` — the tracker: progress, filters, search, spoiler setting,
  export and import, notes, roadmap progress and the Next up planner.
- `app/data/trophies.json` — the official 55 trophies plus a guide, a kind,
  a missable flag, a difficulty rating and sources for each one.
- `main.ts` — the program that hands the guide in.
- `serve.ts` — the local static server for development.
- `screenshots/` — 4 screens of the guide running.
- `shots.json` — which views the screenshots show.

## License

MIT. See `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
