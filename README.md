# FaceFlash 📸

How fast can you put a name to a face? FaceFlash turns a folder of photos into
a name-learning game, perfect for new teams, classes, or big families.

## How it works

Point FaceFlash at a folder of photos. **Each filename is the answer**:
`maya-patel.jpg` becomes *Maya Patel*, `emma_van_dijk.png` becomes
*Emma Van Dijk*. Dashes, underscores and dots all read as spaces.

Photos never leave your machine: everything runs in the browser.

## Game modes

- **Multiple choice**: pick the right name from four. Good while faces are new.
  Keys `1`–`4` work too.
- **Open answer**: type the name yourself. Matching is forgiving: case,
  accents and punctuation are ignored, and one typo is forgiven (two on long
  names).

Correct answers score 100 points plus a growing streak bonus. Missed faces are
collected on the results screen so you can study them before the next round.

No photos handy? The landing page ships with a 12-person sample cast
(portraits from [randomuser.me](https://randomuser.me/)) under
`src/assets/samples/`. The filenames are the answers, so you can verify
scoring right away.

## Development

```sh
npm install
npm run dev      # start dev server
npm test         # unit tests (name parsing, matching, quiz logic)
npm run build    # typecheck + production build
```

Built with Vite, React, TypeScript and [Motion](https://motion.dev).
