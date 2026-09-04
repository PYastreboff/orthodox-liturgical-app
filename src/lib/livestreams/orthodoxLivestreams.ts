import { Platform } from 'react-native';

import bundledChannels from '../../../data/livestreams/channels.json';
import bundledLiveNow from '../../../data/livestreams/live-now.json';

export type LivestreamStatus = 'live' | 'upcoming';

export type OrthodoxLivestream = {
  channelId: string;
  youtubeChannelId: string;
  videoId: string;
  watchUrl: string;
  status: LivestreamStatus;
};

type ChannelsPayload = {
  version?: number;
  channels: {
    id: string;
    youtubeChannelId: string;
  }[];
};

type RemoteLivePayload = {
  updated?: string;
  streams: {
    channelId: string;
    youtubeChannelId: string;
    videoId: string;
    status?: LivestreamStatus;
  }[];
};

const LIVE_NOW_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/livestreams/live-now.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/livestreams/live-now.json',
] as const;

const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 12_000;

let cachedStreams: OrthodoxLivestream[] | null = null;
let cachedAt = 0;
let inflight: Promise<OrthodoxLivestream[]> | null = null;

function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function parseChannels(data: unknown) {
  if (!data || typeof data !== 'object') return [];
  const channels = (data as ChannelsPayload).channels;
  if (!Array.isArray(channels)) return [];
  return channels.filter(
    (channel): channel is ChannelsPayload['channels'][number] =>
      Boolean(channel) &&
      typeof channel.id === 'string' &&
      typeof channel.youtubeChannelId === 'string',
  );
}

/**
 * Bundled hardcoded curated list of streams shipped with the app — the offline
 * /fallback source and the only one used on web (where YouTube fetch is CORS-blocked).
 */
export function getBundledLivestreams(): OrthodoxLivestream[] {
  return parseStreams(bundledLiveNow);
}

function parseStreams(data: unknown): OrthodoxLivestream[] {
  if (!data || typeof data !== 'object') return [];
  const streams = (data as RemoteLivePayload).streams;
  if (!Array.isArray(streams)) return [];
  return streams
    .filter(
      (stream) =>
        Boolean(stream) &&
        typeof stream.channelId === 'string' &&
        typeof stream.youtubeChannelId === 'string' &&
        typeof stream.videoId === 'string',
    )
    .map((stream) => ({
      channelId: stream.channelId,
      youtubeChannelId: stream.youtubeChannelId,
      videoId: stream.videoId,
      watchUrl: watchUrl(stream.videoId),
      status: stream.status === 'live' ? 'live' : 'upcoming',
    }));
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

async function fetchRemoteLiveNow(): Promise<OrthodoxLivestream[]> {
  let lastError: unknown;
  for (const url of LIVE_NOW_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return parseStreams(data);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (lastError) throw lastError;
  return [];
}

/**
 * Detects a channel's current/next livestream video from `/live`. Native-only:
 * browsers block the youtube.com fetch via CORS, so on web this is never called.
 */
async function probeYouTubeChannelLive(
  youtubeChannelId: string,
): Promise<{ videoId: string; status: LivestreamStatus } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`https://www.youtube.com/channel/${youtubeChannelId}/live`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html',
        'User-Agent': 'OrthoDaily/1.0',
      },
    });
    if (!response.ok) return null;
    const html = await response.text();

    const redirectVideoId = response.url.match(/[?&]v=([^&]+)/)?.[1];
    if (redirectVideoId) return { videoId: redirectVideoId, status: 'live' };

    const playerResponse = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/)?.[1];
    if (!playerResponse) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(playerResponse);
    } catch {
      return null;
    }
    const details = (parsed as { videoDetails?: { videoId?: unknown } }).videoDetails;
    const status = (parsed as { playabilityStatus?: { status?: unknown } }).playabilityStatus;
    const videoId = details && typeof details.videoId === 'string' ? details.videoId : null;
    if (!videoId) return null;
    const playable = status && typeof status.status === 'string' ? status.status : '';
    if (playable === 'OK') return { videoId, status: 'live' };
    if (playable === 'LIVE_STREAM_OFFLINE' || playable === 'LIVE_STREAM_PREVIEW') {
      return { videoId, status: 'upcoming' };
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Phone/apps detect their own streams; web relies on the server-refreshed live-now.json. */
async function nativeProbeChannels(): Promise<OrthodoxLivestream[]> {
  const channels = parseChannels(bundledChannels);
  const results = await Promise.all(
    channels.map(async (channel) => {
      const probed = await probeYouTubeChannelLive(channel.youtubeChannelId);
      if (!probed) return null;
      return {
        channelId: channel.id,
        youtubeChannelId: channel.youtubeChannelId,
        videoId: probed.videoId,
        watchUrl: watchUrl(probed.videoId),
        status: probed.status,
      };
    }),
  );
  return results.filter((stream): stream is OrthodoxLivestream => stream !== null);
}

/**
 * Streams shown in the services section.
 * - Web: reads live-now.json (remote, falling back to the bundled copy) — the
 *   only source possible in a browser.
 * - Native: reads live-now.json too, and additionally probes its bundled
 *   channels live so the phone stays current on its own.
 */
export async function fetchOrthodoxLivestreams(options?: {
  force?: boolean;
}): Promise<OrthodoxLivestream[]> {
  if (!options?.force && cachedStreams && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedStreams;
  }
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    const [remote, native] = await Promise.all([
      fetchRemoteLiveNow().catch(() => null as OrthodoxLivestream[] | null),
      Platform.OS === 'web' ? Promise.resolve(null) : nativeProbeChannels(),
    ]);
    const base = remote ?? getBundledLivestreams();
    const merged = dedupeStreams([...base, ...(native ?? [])]);
    cachedStreams = merged;
    cachedAt = Date.now();
    return merged;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}