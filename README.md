# Slate

A Video.js v10 video skin for HTML, styled with CSS: the player dressed as a film-set clapperboard. It started from the Scaffold skin.

## Design

- **The opening slate.** Before the first play, a full clapperboard sits on the poster: PROD, ROLL, SCENE, TAKE, CAM, FPS in chalk. Press play and its stick claps shut, one soft sync flash fires (the frame editors use to line up sound), and the card drops out of frame. The board's own sticks take over from there. When the video ends, a closing slate reads “That’s a wrap!” with the takes and running time.
- **The board.** Controls sit on a solid ink slate with chalk-white type, so they stay legible over bright and dark footage alike. One accent, production yellow, marks progress and focus (`--media-accent-color` restyles it).
- **The clapsticks.** Hinged at the left, open while paused, and they snap shut when the take rolls. The opening angle is computed from the player width, so the gap stays the same at any size. They are also a pointer control (`<slate-clapper>`): click them shut to roll, with a synthesised clap unless muted, and lift them to cut.
- **The board is the remote.** SCENE (`<slate-scene>`) shows the chapter playing now and cuts to the next one on click (Shift-click or arrow keys for the previous). FPS (`<slate-speed>`) shows playback speed as the frame rate a camera would have shot at, so 0.5× reads 48 fps · Overcrank and 2× reads 12 fps · Undercrank, and steps the speed on click. SOUND (`<slate-sound>`) reads Sync, or MOS when muted.
- **Timecode.** A camera-style `HH:MM:SS:FF` readout (`<slate-timecode>`) that interpolates between state updates so the frame digits run smoothly. A visually hidden `<media-time>` keeps the time accessible.
- **Film-strip timeline.** Sprocket holes punched through track, buffer, and fill; chapters read as separate shots, with an editor-style flagged playhead.
- **Set details.** A REC/STBY tally light, the title in marker on camera tape, a TAKE counter (`<slate-take>`) that goes up every time playback starts again, and an error card that reads “No good · take again”.
- **Access.** Every control is keyboard-operable in visual order with a visible yellow focus ring, touch targets grow on coarse pointers, layouts adapt from 960px down to 340px portrait, and the clap, tally blink, and board slide all turn off under reduced motion. Forced-colors mode falls back to system colors.

Source: `src/video/skin.html` (markup), `src/video/slate.css` (design layer), `src/styles/themes/slate.css` (tokens), `src/video/slate-*.ts` (custom elements).

## Develop

```sh
npm run dev
```

The site root (`apps/preview/index.html`) is a showcase page for the skin; the workbench lives at `/workbench.html`. The workbench opens your skin in a slimmed-down version of the Video.js sandbox. It plays "Selected Works", a showcase of Ammar Yasir's Framer templates, from Mux with chapters; change the media in `apps/preview/src/frame/player`. The options panel sets the player's width and aspect ratio, the color scheme, text direction, and language, and playback options such as autoplay, muted, loop, and preload. The arrow button opens the preview on its own. The settings live in the URL, so a link such as `/workbench.html?width=384&ratio=9:16&dir=rtl&locale=ar` opens the workbench in that state, and `/preview.html#width=384&ratio=9:16` opens the preview alone.

## Deploy

```sh
npm run deploy
```

It asks where to deploy the workbench: Vercel, Netlify, or Cloudflare Pages. Name one to skip the question, such as `npm run deploy vercel`. The first time, the host's CLI signs you in and creates the project, then every run prints the URL. Vercel and Netlify deploy to a preview URL you can share; to deploy to production instead, add `--prod` to the `deploy:netlify` script, or to both commands in `deploy:vercel`.

To deploy on every push instead, put the project on GitHub and import it on Vercel or Netlify; `vercel.json` and `netlify.toml` already describe the build. The build uses relative URLs, so `dist/` also works on any static host, including in a subfolder.

## Where things live

- `src/`: your skin, and only your skin. Keep, rewrite, or delete any of it.
  - `src/video/`: the skin component and its parts.
  - `src/styles/`: theme tokens and shared styles the skin imports, when it started from a packaged skin.
  - `src/skin.css`: global styles for the skin.
- `apps/preview/`: the workbench that previews the skin. You don't need to change it.
  - `src/shell/`: the Shadcn shell.
  - `src/frame/`: the page the shell frames. `player` mounts your skin in a player and sets the media it plays.
  - `public/`: files the preview serves, such as the chapters track.
- `vercel.json`, `netlify.toml`: how those hosts build the workbench.
- `skin.json`: what this skin is built from. Keep it; it records the Video.js version the skin was created with.

## Learn more

- [Build your own skin](https://videojs.org/docs/framework/html/guides/build-your-own-skin)
- [Customize skins](https://videojs.org/docs/framework/html/guides/customize-skins)
- [UI components](https://videojs.org/docs/framework/html/guides/ui-components)
