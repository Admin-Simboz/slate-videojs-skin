import { PlayerController, playerContext, selectPlayback, selectVolume, UIElement } from '@videojs/html';

/** The clap: a short burst of filtered noise with a fast decay, synthesised so the skin ships no audio file. */
const CLAP = { seconds: 0.09, frequency: 1800, q: 0.9, peak: 0.5 } as const;

let audioContext: AudioContext | null = null;

function playClap(volume: number): void {
  if (typeof AudioContext === 'undefined' || volume <= 0) return;
  audioContext ??= new AudioContext();
  const context = audioContext;
  if (context.state === 'suspended') void context.resume();

  const length = Math.floor(context.sampleRate * CLAP.seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 4;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = buffer;
  filter.type = 'bandpass';
  filter.frequency.value = CLAP.frequency;
  filter.Q.value = CLAP.q;
  gain.gain.value = CLAP.peak * volume;
  source.connect(filter).connect(gain).connect(context.destination);
  source.start();
}

/**
 * The clapsticks as a pointer control: clap them shut to roll the take (with a clap, unless muted), lift them to cut.
 * A shortcut for pointer users only, so it stays out of the tab order and the accessibility tree; the play button and
 * the Space/K hotkeys do the same job for everyone else.
 */
class SlateClapperElement extends UIElement {
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #volume = new PlayerController(this, playerContext, selectVolume);

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
    this.addEventListener('pointerup', this.#swallow);
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerup', this.#swallow);
    this.removeEventListener('click', this.#onClick);
  }

  /** The player's tap gesture also toggles playback; keep it from undoing the clap. */
  #swallow = (event: Event) => {
    event.stopPropagation();
  };

  #onClick = () => {
    const playback = this.#playback.value;
    if (!playback) return;
    if (playback.paused || playback.ended) {
      const volume = this.#volume.value;
      if (volume && !volume.muted) playClap(volume.volume);
      void playback.play();
    } else {
      playback.pause();
    }
  };
}

if (!customElements.get('slate-clapper')) {
  customElements.define('slate-clapper', SlateClapperElement);
}
