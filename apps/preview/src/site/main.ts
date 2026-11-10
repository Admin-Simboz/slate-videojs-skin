import '@videojs/html/i18n';
import '@/skin.css';
import './site.css';
import { createPlayer } from '../frame/player';

// The same player the workbench previews, mounted in the showcase hero.
const mount = document.getElementById('player');

if (mount) {
  const i18n = document.createElement('media-i18n');
  i18n.append(createPlayer());
  mount.append(i18n);
}
