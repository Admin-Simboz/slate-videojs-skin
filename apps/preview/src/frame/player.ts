import '@videojs/html/video/player';
import '@videojs/html/media/mux-video';
import '@/video/skin';
import skinTemplate from '@/video/skin.html?raw';

/**
 * What the preview plays: a Mux playback ID, the poster frame (seconds) and the chapters for the time
 * slider (served from `apps/preview/public`). Swap the ID to try the skin with your own Mux video.
 */
const MEDIA = {
  playbackId: 'U9Be00ynyUk5SxMA9SdZy24OgaRr2iXiEZOI02phLO9YI', // "Selected Works" — Ammar Yasir's Framer templates
  title: 'Selected Works', // chalked on the slate; overrides the title stored on the Mux asset
  posterTime: 54,
  chapters: './selected-works-chapters.vtt',
};

const SRC = `https://stream.mux.com/${MEDIA.playbackId}.m3u8`;
const POSTER = `https://image.mux.com/${MEDIA.playbackId}/thumbnail.webp?time=${MEDIA.posterTime}`;
const CHAPTERS = MEDIA.chapters;

const MEDIA_PLACEHOLDER = '<!-- Add a compatible media component here. -->';

export function createPlayer(): HTMLElement {
  const player = document.createElement('video-player');
  player.setAttribute('poster', POSTER);
  player.setAttribute('content-title', MEDIA.title);

  player.innerHTML = skinTemplate.replace(
    MEDIA_PLACEHOLDER,
    `<mux-video src="${SRC}" playsinline crossorigin><track kind="chapters" label="English" srclang="en" src="${CHAPTERS}" default></mux-video>`
  );

  return player;
}
