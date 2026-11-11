import { PlayerController, type PropertyValues, playerContext, selectPlaybackRate, UIElement } from '@videojs/html';

import { FRAMES_PER_SECOND } from './slate-timecode';

/**
 * The slate's FPS cell, which doubles as a speed control in camera terms. Slow motion is shot overcranked (48 fps
 * played back at 24 looks half speed); fast motion is undercranked. So the cell shows the frame rate a camera would
 * have needed for the current playback rate, and its button steps to the next rate.
 *
 * Markup it expects inside: a `<button>`, plus `[data-part="fps"]` and `[data-part="crank"]` for the readout.
 */
class SlateSpeedElement extends UIElement {
  #rate = new PlayerController(this, playerContext, selectPlaybackRate);

  #button: HTMLButtonElement | null = null;
  #fpsNode: Element | null = null;
  #crankNode: Element | null = null;
  #renderedRate = Number.NaN;

  connectedCallback() {
    super.connectedCallback();
    this.#button = this.querySelector('button');
    this.#fpsNode = this.querySelector('[data-part="fps"]');
    this.#crankNode = this.querySelector('[data-part="crank"]');
    this.#button?.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#button?.removeEventListener('click', this.#onClick);
  }

  update(changed: PropertyValues) {
    super.update(changed);
    const rate = this.#rate.value?.playbackRate ?? 1;
    if (rate === this.#renderedRate) return;
    this.#renderedRate = rate;
    this.#render(rate);
  }

  #render(rate: number) {
    const crank = rate < 1 ? 'over' : rate > 1 ? 'under' : '';
    const fps = Math.round(FRAMES_PER_SECOND / rate);

    if (crank) this.setAttribute('data-crank', crank);
    else this.removeAttribute('data-crank');
    if (this.#fpsNode) this.#fpsNode.textContent = String(fps);
    if (this.#crankNode) this.#crankNode.textContent = crank ? `${crank}crank` : '';
    this.#button?.setAttribute('aria-label', `Playback speed ${rate}×. Change speed`);
  }

  /** Steps to the next available rate, wrapping from the fastest back to the slowest. */
  #onClick = () => {
    const state = this.#rate.value;
    if (!state || state.playbackRates.length === 0) return;
    const rates = [...state.playbackRates].sort((a, b) => a - b);
    const next = rates.find((rate) => rate > state.playbackRate) ?? rates[0]!;
    state.setPlaybackRate(next);
  };
}

if (!customElements.get('slate-speed')) {
  customElements.define('slate-speed', SlateSpeedElement);
}
