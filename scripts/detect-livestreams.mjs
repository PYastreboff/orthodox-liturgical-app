/**
 * Detect each bundled channel's current/next YouTube livestream and write the
 * results to data/livestreams/live-now.json.
 *
 * Runs server-side (GitHub Actions) where there is no CORS — browsers block the
 * youtube.com fetch, which is why this must NOT run on the client. The app reads
 * live-now.json as its single source, so web and native stay identical.
 *
 * Usage: node scripts/detect-livestreams.mjs [--dry-run]
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const channelsPath = join(root, 'data', 'livestreams', 'channels.json');
const liveNowPath = join(root, 'data', 'livestreams', 'live-now.json');

const TIMEOUT_MS = 15_000;
const DRY_RUN = process.argv.includes('--dry-run');

const statuses = new Set(['live', 'upcoming']);
const VIDEO_ID = /^[\w-]{11}$/;
/** A channel's last detected stream is dropped once it has not been seen for this long. */
const MAX_UNSEEN_MS = 7 * 24 * 60 * 60 * 1000;
/** probe() result when the request itself failed (as opposed to "nothing scheduled"). */
const PROBE_FAILED = Symbol('probe-failed');

function loadChannels() {
  const raw = JSON.parse(readFileSync(channelsPath, 'utf8'));
  if (!raw || !Array.isArray(raw.channels)) return [];
  return raw.channels.filter(
    (c) => c && typeof c.id === 'string' && typeof c.youtubeChannelId === 'string',
  );
}

function loadExisting() {
  try {
    const raw = JSON.parse(readFileSync(liveNowPath, 'utf8'));
    if (raw && Array.isArray(raw.streams)) return raw.streams;
  } catch {
    /* first run — no prior file */
  }
  return [];
}

async function probe(channelId, youtubeChannelId) {
  try {
    const response = await fetch(
      `https://www.youtube.com/channel/${youtubeChannelId}/live`,
      {
        redirect: 'follow',
        headers: { Accept: 'text/html', 'User-Agent': 'OrthoDaily/1.0' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!response.ok) return PROBE_FAILED;
    const html = await response.text();

    const redirectVideoId = response.url.match(/[?&]v=([^&]+)/)?.[1];
    if (redirectVideoId && VIDEO_ID.test(redirectVideoId)) {
      return { channelId, youtubeChannelId, videoId: redirectVideoId, status: 'live' };
    }

    const playerResponse = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/)?.[1];
    if (!playerResponse) return null;
    const parsed = JSON.parse(playerResponse);
    const videoId = parsed?.videoDetails?.videoId;
    if (typeof videoId !== 'string' || !VIDEO_ID.test(videoId)) return null;
    const playable = String(parsed?.playabilityStatus?.status ?? '');
    if (playable === 'OK') return { channelId, youtubeChannelId, videoId, status: 'live' };
    if (playable === 'LIVE_STREAM_OFFLINE' || playable === 'LIVE_STREAM_PREVIEW') {
      return { channelId, youtubeChannelId, videoId, status: 'upcoming' };
    }
    return null;
  } catch {
    return PROBE_FAILED;
  }
}

/** Avoid an hourly commit when nothing changed; still refresh `seenAt` twice a day. */
function shouldWrite(streams, now) {
  let previous;
  try {
    previous = JSON.parse(readFileSync(liveNowPath, 'utf8'));
  } catch {
    return true;
  }
  const signature = (list) =>
    JSON.stringify((list ?? []).map((s) => [s.channelId, s.videoId, s.status]));
  const age = now - Date.parse(previous?.updated ?? '');
  return (
    signature(previous?.streams) !== signature(streams) ||
    previous?.schemaVersion !== 1 ||
    !(age < 12 * 60 * 60 * 1000)
  );
}

async function main() {
  const channels = loadChannels();
  const prior = new Map(loadExisting().map((s) => [s.channelId, s]));
  const detected = await Promise.all(
    channels.map((c) => probe(c.id, c.youtubeChannelId)),
  );

  const now = Date.now();
  const streams = [];
  for (let i = 0; i < channels.length; i += 1) {
    const channel = channels[i];
    const found = detected[i];
    if (found && found !== PROBE_FAILED) {
      streams.push({ ...found, seenAt: new Date(now).toISOString() });
      continue;
    }
    // Only a failed request keeps the previous entry — "nothing scheduled" clears it.
    // A kept entry is no longer known to be live, and expires after MAX_UNSEEN_MS.
    const previous = found === PROBE_FAILED ? prior.get(channel.id) : undefined;
    const seenAt = Date.parse(previous?.seenAt ?? '');
    if (
      previous &&
      typeof previous.videoId === 'string' &&
      VIDEO_ID.test(previous.videoId) &&
      Number.isFinite(seenAt) &&
      now - seenAt < MAX_UNSEEN_MS
    ) {
      streams.push({
        channelId: channel.id,
        youtubeChannelId: channel.youtubeChannelId,
        videoId: previous.videoId,
        status: statuses.has(previous.status) && previous.status !== 'live' ? previous.status : 'upcoming',
        seenAt: previous.seenAt,
      });
    }
  }

  const payload = {
    schemaVersion: 1,
    updated: new Date(now).toISOString(),
    streams,
  };

  const body = `${JSON.stringify(payload, null, 2)}\n`;
  if (!DRY_RUN && !shouldWrite(streams, now)) {
    console.log('No stream changes; leaving live-now.json untouched.');
    return;
  }
  if (!DRY_RUN) {
    mkdirSync(dirname(liveNowPath), { recursive: true });
    writeFileSync(liveNowPath, body, 'utf8');
  }
  console.log(body);
  console.log(`Detected ${streams.length}/${channels.length} channels${DRY_RUN ? ' (dry run)' : ''}.`);
}

try {
  await main();
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}