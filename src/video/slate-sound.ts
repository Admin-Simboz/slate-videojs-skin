import { PlayerController, type PropertyValues, playerContext, selectVolume, UIElement } from '@videojs/html';

/**
 * The slate's SOUND cell: "Sync" while sound is on, "MOS" when muted, the on-set mark for a take shot without sound.
 * Decorative, so it's hidden from assistive technology; the mute button carries the accessible state.
 */
class SlateSoundElement extends UIElement {
  #volume = new PlayerController(this, playerContext, selectVolume);
  #renderedMos: boolean | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('aria-hidden', 'true');
  }

  update(changed: PropertyValues) {
    super.update(changed);
    const volume = this.#volume.value;
    const mos = !!volume && (volume.muted || volume.volume === 0);
    if (mos === this.#renderedMos) return;
    this.#renderedMos = mos;
    this.toggleAttribute('data-mos', mos);
    this.textContent = mos ? 'MOS' : 'Sync';
  }
}

if (!customElements.get('slate-sound')) {
  customElements.define('slate-sound', SlateSoundElement);
}
