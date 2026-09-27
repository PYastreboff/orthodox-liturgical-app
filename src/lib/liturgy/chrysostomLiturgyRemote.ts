/**
 * Remote Chrysostom liturgy text (JSON on GitHub). Bundled copy used as fallback.
 */
import bundledLiturgy from '../../../data/liturgy/chrysostom-liturgy.json';
import type { ChrysostomSection } from './chrysostomLiturgyTypes';
import { createLiturgyLoader } from './liturgyRemoteLoader';

export type ChrysostomLiturgyState =
  | { status: 'loading'; sections: readonly ChrysostomSection[] }
  | { status: 'ready'; sections: readonly ChrysostomSection[] }
  | { status: 'offline'; sections: readonly ChrysostomSection[]; error: string };

const loader = createLiturgyLoader({
  bundled: bundledLiturgy,
  fileName: 'chrysostom-liturgy.json',
});

export const fetchChrysostomLiturgy = loader.fetchLiturgy;
export const getCachedChrysostomLiturgy = loader.getCached;
export const getChrysostomLiturgySource = loader.getSource;
