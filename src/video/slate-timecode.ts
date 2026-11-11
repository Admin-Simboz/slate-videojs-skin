import {
  PlayerController,
  type PropertyValues,
  playerContext,
  selectPlayback,
  selectPlaybackRate,
  selectTime,
  UIElement,
} from '@videojs/html';

/** Nominal frame rate for the HH:MM:SS:FF readout. Cinema slates count at 24. */
export const FRAMES_PER_SECOND = 24;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const MS_PER_SECOND = 1000;

const EMPTY_HOURS = '00:';
const EMPTY_REST = '00:00:00';

const pad = (value: number) => String(value).padStart(2, '0');

interface Timecode {
  /** `HH:` — its own part so narrow layouts can hide it. */
  hours: string;
  /** `MM:SS:FF` */
  rest: string;
}

export function formatTimecode(seconds: number): Timecode {
  if (!Number.isFinite(seconds) || seconds <= 0) return { hours: EMPTY_HOURS, rest: EMPTY_REST };
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / SECONDS_PER_HOUR);
  const minutes = Math.floor((whole % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const secs = whole % SECONDS_PER_MINUTE;
  const frames = Math.min(FRAMES_PER_SECOND - 1, Math.floor((seconds - whole) * FRAMES_PER_SECOND));
  return { hours: `${pad(hours)}:`, rest: `${pad(minutes)}:${pad(secs)}:${pad(frames)}` };
}

/**
 * A camera-style timecode readout (HH:MM:SS:FF) of the current time, or of the duration with `type="duration"`.
 *
 * Player state reports the current time a few times per second, which would make the frame digits stutter. While
 * playing, the readout interpolates from the last reported time on each animation frame, then re-syncs on every state
 * update. It only touches the DOM when the text changes. The readout is decorative; the skin keeps a `<media-time>`
 * for assistive technology.
 */
class SlateTimecodeElement extends UIElement {
  #time = new PlayerController(this, playerContext, selectTime);
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #rate = new PlayerController(this, playerContext, selectPlaybackRate);

  #anchorTime = 0;
  #anchorStamp = 0;
  #frameRequest = 0;
  #hoursNode = document.createElement('span');
  #restNode = document.createTextNode('');

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
    this.#hoursNode.className = 'slate-tc-hours';
    this.replaceChildren(this.#hoursNode, this.#restNode);
    this.#render(0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#stopTicking();
  }

  update(changed: PropertyValues) {
    super.update(changed);
    const time = this.#time.value;
    const playback = this.#playback.value;
    if (!time) return;

    if (this.getAttribute('type') === 'duration') {
      this.#render(time.duration);
      return;
    }

    this.#anchorTime = time.currentTime;
    this.#anchorStamp = performance.now();
    this.#render(time.currentTime);

    const running = playback && !playback.paused && !playback.ended && !playback.waiting && !time.seeking;
    if (running) this.#startTicking();
    else this.#stopTicking();
  }

  #startTicking() {
    if (this.#frameRequest) return;
    this.#frameRequest = requestAnimationFrame(this.#tick);
  }

  #stopTicking() {
    cancelAnimationFrame(this.#frameRequest);
    this.#frameRequest = 0;
  }

  #tick = (now: number) => {
    const rate = this.#rate.value?.playbackRate ?? 1;
    const duration = this.#time.value?.duration ?? Number.POSITIVE_INFINITY;
    const elapsed = ((now - this.#anchorStamp) / MS_PER_SECOND) * rate;
    this.#render(Math.min(this.#anchorTime + elapsed, duration));
    this.#frameRequest = requestAnimationFrame(this.#tick);
  };

  #render(seconds: number) {
    const { hours, rest } = formatTimecode(seconds);
    if (this.#hoursNode.textContent !== hours) this.#hoursNode.textContent = hours;
    if (this.#restNode.data !== rest) this.#restNode.data = rest;
  }
}

if (!customElements.get('slate-timecode')) {
  customElements.define('slate-timecode', SlateTimecodeElement);
}
