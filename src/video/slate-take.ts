import { PlayerController, type PropertyValues, playerContext, selectPlayback, UIElement } from '@videojs/html';

const TAKE_DIGITS = 2;

/**
 * The slate's TAKE counter: every time playback starts again after a pause or the end, it's a new take. Purely
 * decorative, so it's hidden from assistive technology.
 */
class SlateTakeElement extends UIElement {
  #playback = new PlayerController(this, playerContext, selectPlayback);
  #take = 1;
  #wasPlaying = false;
  #hasPlayed = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
    this.#render();
  }

  update(changed: PropertyValues) {
    super.update(changed);
    const playback = this.#playback.value;
    if (!playback) return;

    const playing = !playback.paused && !playback.ended;
    if (playing && !this.#wasPlaying) {
      if (this.#hasPlayed) this.#take += 1;
      this.#hasPlayed = true;
      this.#render();
    }
    this.#wasPlaying = playing;
  }

  #render() {
    this.textContent = String(this.#take).padStart(TAKE_DIGITS, '0');
  }
}

if (!customElements.get('slate-take')) {
  customElements.define('slate-take', SlateTakeElement);
}
