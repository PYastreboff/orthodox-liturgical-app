import bundledChannels from '../../../data/livestreams/channels.json';

export type OrthodoxLivestreamChannel = {
  id: string;
  youtubeChannelId: string;
};

export type OrthodoxLivestream = {
  channelId: string;
  youtubeChannelId: string;
  videoId: string;
  watchUrl: string;
};

type ChannelsPayload = {
  version?: number;
  channels: OrthodoxLivestreamChannel[];
};

type RemoteLivePayload = {
  updated?: string;
  streams: Array<{
    channelId: string;
    youtubeChannelId: string;
    videoId: string;
  }>;
};

const LIVE_NOW_URLS = [
  'https://raw.githubusercontent.com/PYastreboff/orthodox-liturgical-app/main/data/livestreams/live-now.json',
  'https://cdn.jsdelivr.net/gh/PYastreboff/orthodox-liturgical-app@main/data/livestreams/live-now.json',
] as const;

const CACHE_TTL_MS = 5 * 60 * 1000;
const PROBE_TIMEOUT_MS = 12_000;

let cachedStreams: OrthodoxLivestream[] | null = null;
let cachedAt = 0;
let inflight: Promise<OrthodoxLivestream[]> | null = null;

function parseChannels(data: unknown): OrthodoxLivestreamChannel[] {
  if (!data || typeof data !== 'object') return [];
  const channels = (data as ChannelsPayload).channels;
  if (!Array.isArray(channels)) return [];
  return channels.filter(
    (channel): channel is OrthodoxLivestreamChannel =>
      Boolean(channel) &&
      typeof channel.id === 'string' &&
      typeof channel.youtubeChannelId === 'string',
  );
}

export function getOrthodoxLivestreamChannels(): readonly OrthodoxLivestreamChannel[] {
  return parseChannels(bundledChannels);
}

function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function toLivestream(entry: {
  channelId: string;
  youtubeChannelId: string;
  videoId: string;
}): OrthodoxLivestream {
  return {
    channelId: entry.channelId,
    youtubeChannelId: entry.youtubeChannelId,
    videoId: entry.videoId,
    watchUrl: watchUrl(entry.videoId),
  };
}

async function fetchRemoteLiveNow(): Promise<OrthodoxLivestream[]> {
  let lastError: unknown;
  for (const url of LIVE_NOW_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as RemoteLivePayload;
      if (!Array.isArray(data.streams)) return [];
      return data.streams
        .filter(
          (stream) =>
            typeof stream.channelId === 'string' &&
            typeof stream.youtubeChannelId === 'string' &&
            typeof stream.videoId === 'string',
        )
        .map(toLivestream);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (lastError) throw lastError;
  return [];
}

/** Returns a video id when the channel is broadcasting on YouTube right now. */
export async function probeYouTubeChannelLive(youtubeChannelId: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const response = await fetch(`https://www.youtube.com/channel/${youtubeChannelId}/live`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        Accept: 'text/html',
        'User-Agent': 'OrthoDaily/1.0',
      },
    });
    const match = response.url.match(/[?&]v=([^&]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function probeBundledChannels(
  channels: readonly OrthodoxLivestreamChannel[],
): Promise<OrthodoxLivestream[]> {
  const results = await Promise.all(
    channels.map(async (channel) => {
      const videoId = await probeYouTubeChannelLive(channel.youtubeChannelId);
      if (!videoId) return null;
      return toLivestream({
        channelId: channel.id,
        youtubeChannelId: channel.youtubeChannelId,
        videoId,
      });
    }),
  );
  return results.filter((stream): stream is OrthodoxLivestream => stream !== null);
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

export async function fetchOrthodoxLivestreams(options?: {
  force?: boolean;
}): Promise<OrthodoxLivestream[]> {
  if (!options?.force && cachedStreams && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedStreams;
  }
  if (!options?.force && inflight) return inflight;

  inflight = (async () => {
    const channels = getOrthodoxLivestreamChannels();
    const [remote, probed] = await Promise.all([
      fetchRemoteLiveNow().catch(() => [] as OrthodoxLivestream[]),
      probeBundledChannels(channels),
    ]);
    const merged = dedupeStreams([...remote, ...probed]);
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
