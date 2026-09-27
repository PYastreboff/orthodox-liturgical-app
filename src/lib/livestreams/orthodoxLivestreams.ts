import bundledChannels from '../../../data/livestreams/channels.json';
import bundledLiveNow from '../../../data/livestreams/live-now.json';
import { fetchJson } from '../net/fetchJson';
import { isSupportedSchema } from '../net/remoteSchema';

export type LivestreamStatus = 'live' | 'upcoming';

export type OrthodoxLivestream = {
  channelId: string;
  youtubeChannelId: string;
  videoId: string;
  watchUrl: string;
  status: LivestreamStatus;
};

/**
 * live-now.json is refreshed server-side by `.github/workflows/detect-livestreams.yml`;
 * the app never contacts YouTube until the user taps a stream.
 */
const LIVE_NOW_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/livestreams/live-now.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/livestreams/live-now.json',
] as const;

const LIVESTREAM_SCHEMA_VERSION = 1;
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;
/** If the detector hasn't written for this long, nothing is claimed to be live. */
const LIVE_STALE_MS = 24 * 60 * 60 * 1000;
const VIDEO_ID = /^[\w-]{11}$/;

let cachedStreams: OrthodoxLivestream[] | null = null;
let cachedAt = 0;
let inflight: Promise<OrthodoxLivestream[]> | null = null;

function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** Channels this binary has labels for; streams for any other channel are ignored. */
const knownChannels: ReadonlyMap<string, string> = new Map(
  (Array.isArray(bundledChannels.channels) ? bundledChannels.channels : [])
    .filter((c) => typeof c?.id === 'string' && typeof c?.youtubeChannelId === 'string')
    .map((c) => [c.id, c.youtubeChannelId]),
);

/** Bundled copy shipped with the app — the offline fallback. */
export function getBundledLivestreams(): OrthodoxLivestream[] {
  return parseStreams(bundledLiveNow) ?? [];
}

/** Null when the payload is unusable (bad shape or unsupported schema). */
export function parseStreams(data: unknown): OrthodoxLivestream[] | null {
  if (!data || typeof data !== 'object' || !isSupportedSchema(data, LIVESTREAM_SCHEMA_VERSION)) {
    return null;
  }
  const { streams, updated } = data as { streams?: unknown; updated?: unknown };
  if (!Array.isArray(streams)) return null;
  const updatedAt = typeof updated === 'string' ? Date.parse(updated) : NaN;
  const stale = !(Date.now() - updatedAt < LIVE_STALE_MS);

  const result: OrthodoxLivestream[] = [];
  for (const raw of streams as Record<string, unknown>[]) {
    if (!raw || typeof raw !== 'object') continue;
    const { channelId, videoId, status } = raw;
    if (typeof channelId !== 'string' || typeof videoId !== 'string') continue;
    const youtubeChannelId = knownChannels.get(channelId);
    if (!youtubeChannelId || !VIDEO_ID.test(videoId)) continue;
    result.push({
      channelId,
      youtubeChannelId,
      videoId,
      watchUrl: watchUrl(videoId),
      status: status === 'live' && !stale ? 'live' : 'upcoming',
    });
  }
  return result;
}

function dedupeStreams(streams: readonly OrthodoxLivestream[]): OrthodoxLivestream[] {
  const seen = new Set<string>();
  const unique: OrthodoxLivestream[] = [];
  for (const stream of streams) {
    const key = `${stream.youtubeChannelId}:${stream.videoId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(stream);
  }
  return unique;
}

/** Live streams first; relative order within each group is preserved. */
function sortLiveFirst(streams: OrthodoxLivestream[]): OrthodoxLivestream[] {
  const live = streams.filter((stream) => stream.status === 'live');
  const upcoming = streams.filter((stream) => stream.status !== 'live');
  return [...live, ...upcoming];
}

async function fetchRemoteLiveNow(): Promise<OrthodoxLivestream[] | null> {
  for (const url of LIVE_NOW_URLS) {
    try {
      const streams = parseStreams(await fetchJson(url, { timeoutMs: FETCH_TIMEOUT_MS }));
      if (streams) return streams;
    } catch {
      // try next mirror
    }
  }
  return null;
}

/** Streams shown in the services section: remote live-now.json, else the bundled copy. */
export async function fetchOrthodoxLivestreams(options?: {
  force?: boolean;
}): Promise<OrthodoxLivestream[]> {
  if (!options?.force && cachedStreams && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedStreams;
  }
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    const remote = await fetchRemoteLiveNow();
    cachedStreams = sortLiveFirst(dedupeStreams(remote ?? getBundledLivestreams()));
    cachedAt = Date.now();
    return cachedStreams;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}
