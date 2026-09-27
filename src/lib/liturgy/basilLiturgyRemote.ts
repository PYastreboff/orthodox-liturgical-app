/**
 * Remote Basil liturgy text (JSON on GitHub). Bundled copy used as fallback.
 */
import bundledLiturgy from '../../../data/liturgy/basil-liturgy.json';
import type { BasilSection } from './basilLiturgyTypes';
import { createLiturgyLoader } from './liturgyRemoteLoader';

export type BasilLiturgyState =
  | { status: 'loading'; sections: readonly BasilSection[] }
  | { status: 'ready'; sections: readonly BasilSection[] }
  | { status: 'offline'; sections: readonly BasilSection[]; error: string };

const loader = createLiturgyLoader({
  bundled: bundledLiturgy,
  fileName: 'basil-liturgy.json',
});

export const fetchBasilLiturgy = loader.fetchLiturgy;
export const getCachedBasilLiturgy = loader.getCached;
export const getBasilLiturgySource = loader.getSource;
