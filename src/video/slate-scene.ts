import {
  type MediaTextCue,
  PlayerController,
  type PropertyValues,
  playerContext,
  selectTextTrack,
  selectTime,
  UIElement,
} from '@videojs/html';

const SCENE_DIGITS = 2;
/** Chapter titles read "Name — Description"; the board has room for the name only. */
const NAME_SEPARATOR = ' — ';
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);

/** Index of the chapter playing at `time`, or -1 before the first one starts. */
export function findScene(cues: readonly MediaTextCue[], time: number): number {
  for (let index = cues.length - 1; index >= 0; index -= 1) {
    if (time >= cues[index]!.startTime) return index;
  }
  return -1;
}

/**
 * The slate's SCENE cell, driven by the chapters track: it shows the chapter playing now, and its button cuts to the
 * next scene (Shift+click, or the arrow keys while focused, for the previous one). Without chapters it hides itself.
 *
 * Markup it expects inside: a `<button>`, plus `[data-part="number"]` and `[data-part="name"]` for the readout.
 */
class SlateSceneElement extends UIElement {
  #tracks = new PlayerController(this, playerContext, selectTextTrack);
  #time = new PlayerController(this, playerContext, selectTime);

  #button: HTMLButtonElement | null = null;
  #numberNode: Element | null = null;
  #nameNode: Element | null = null;
  #renderedKey = '';

  connectedCallback() {
    super.connectedCallback();
    this.#button = this.querySelector('button');
    this.#numberNode = this.querySelector('[data-part="number"]');
    this.#nameNode = this.querySelector('[data-part="name"]');
    this.#button?.addEventListener('click', this.#onClick);
    this.#button?.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#button?.removeEventListener('click', this.#onClick);
    this.#button?.removeEventListener('keydown', this.#onKeyDown);
  }

  update(changed: PropertyValues) {
    super.update(changed);
    const cues = this.#cues();
    const index = findScene(cues, this.#time.value?.currentTime ?? 0);
    const key = `${cues.length}:${index}`;
    if (key === this.#renderedKey) return;
    this.#renderedKey = key;
    this.#render(cues, index);
  }

  #cues(): readonly MediaTextCue[] {
    return this.#tracks.value?.chaptersCues ?? [];
  }

  #render(cues: readonly MediaTextCue[], index: number) {
    this.toggleAttribute('data-empty', cues.length === 0);
    if (cues.length === 0) return;

    const scene = Math.max(index, 0);
    const name = cues[scene]!.text.split(NAME_SEPARATOR)[0]!.trim();
    const number = String(scene + 1).padStart(SCENE_DIGITS, '0');

    if (this.#numberNode) this.#numberNode.textContent = number;
    if (this.#nameNode) this.#nameNode.textContent = name;
    this.#button?.setAttribute('aria-label', `Scene ${scene + 1} of ${cues.length}: ${name}. Next scene`);
  }

  /** Cuts to the scene `offset` away from the current one, wrapping around the reel. */
  #cut(offset: number) {
    const cues = this.#cues();
    const time = this.#time.value;
    if (cues.length === 0 || !time) return;
    const current = Math.max(findScene(cues, time.currentTime), 0);
    const next = (current + offset + cues.length) % cues.length;
    void time.seek(cues[next]!.startTime);
  }

  #onClick = (event: MouseEvent) => {
    this.#cut(event.shiftKey ? -1 : 1);
  };

  /** Arrow keys step through scenes here instead of seeking, so the player's own arrow hotkeys must not see them. */
  #onKeyDown = (event: KeyboardEvent) => {
    const offset = PREVIOUS_KEYS.has(event.key) ? -1 : NEXT_KEYS.has(event.key) ? 1 : 0;
    if (!offset) return;
    event.preventDefault();
    event.stopPropagation();
    this.#cut(offset);
  };
}

if (!customElements.get('slate-scene')) {
  customElements.define('slate-scene', SlateSceneElement);
}
