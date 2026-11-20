# Platinum Road — GTA 6 Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Szeven/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Szeven/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, open-source guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver, 46 bronze. No network, no account, no ads: static files that open in any desktop browser.

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade; tick them off, progress saves in the browser (localStorage), and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, side quests), by grade, by earned / not earned, plus full-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — the order to earn them in, in six stages built from the official descriptions: story first, side stories, activities and skills, collectibles and the world, odd jobs and cleanup, then 100% completion and the platinum.
- **Missables flagged** — the four trophies that can be missed are marked on every view, with a dedicated missables page.
- **A guide for every trophy, in our own words, with its sources named** — what to do, where and how, and when it can be missed. Names, descriptions and grades are the official list as PlayStation publishes it (via Exophase and PSNProfiles, 18 Nov 2026); the guides are our own advice from those descriptions and are not yet verified in-game — where a place or trigger is not pinned down, the guide says so instead of inventing one.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static HTTP server — the app loads nothing from outside its own files and works with the network off.

Add `?demo=1` to the URL to load sample progress (13 of 55 earned) so you can try the tracker at a glance; your own progress is saved separately in the browser.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-frontend.ts` library.

## Sources

- Official trophy list (names, descriptions, grades): Exophase — https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- PSN progress targets: PSNProfiles — https://psnprofiles.com/trophies/43531-grand-theft-auto-vi
- Guides: written for this entry from the official descriptions.

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
