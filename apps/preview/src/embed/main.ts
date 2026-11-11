// The embeddable player: just the Slate skin, edge to edge, for <iframe> embeds on other sites.
// Reuses the preview page's player and layout; embed.css only drops the padding and fits the frame.
import '@videojs/html/i18n';
import '@/skin.css';
import '../frame/preview.css';
import './embed.css';
import { createPlayer } from '../frame/player';

const i18n = document.createElement('media-i18n');
const wrapper = document.createElement('div');

wrapper.className = 'preview-player';
i18n.append(createPlayer());
wrapper.append(i18n);
document.getElementById('root')!.append(wrapper);
