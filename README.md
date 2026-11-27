# The World — Friday 27 November 2026

A front-page newspaper image summing up the world's news of Friday
27 November 2026, built for the make.fun `news-image-20261127` bounty.

## What it is

`entry.png` (1024x1024, 175,856 bytes) is a hand-drawn front page,
"The World", with:

- 3 lead stories with original flat illustrations: the Jazan refinery
  attack (one killed), Zelenskiy's warning of a new mass Russian strike
  as Ukraine hits the Marinovka air base, and the US tariff proposal on
  14 economies with Asia's stock rebound.
- A stat strip (1 killed in Jazan; 31 killed in the Cairo tanker blast;
  2 Italians killed in Kuwait; 300+ Russians killed backing Mali's junta;
  Brent $94.64; UK net migration 77,000).
- A reported-day timeline, 12 small cards with drawn icons, a world map
  with 15 numbered pins, a stories-by-region panel, 24 numbered briefs,
  and a DATE CHECK box (what was left out, what has not happened yet).
- 39 stories across 8 regions, every one verified from wire reports
  filed 26-27 November 2026 (Reuters, BBC, AP, AFP, Al Jazeera,
  Saudi Gazette, Khaleej Times, Bloomberg, Copernicus). Disputed claims
  are attributed as claims, never stated as fact.

## How it works

`main.ts` (Node 22, standard library only) verifies the PNG chunk
structure — signature, per-chunk CRC-32, IHDR 1024x1024, IEND present,
no trailing bytes, under the 1 MiB cap — then copies `entry.png` to the
output directory. It runs with no network and writes the same bytes on
every run.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The image itself was drawn by a Python/PIL render script kept beside the
build (deterministic: two renders are byte-identical).

## Entry

- Competition: https://make.fun/bounty/news-image-20261127
- Referral: https://make.fun/r/2zfbgsbw
- License: MIT (see LICENSE)
