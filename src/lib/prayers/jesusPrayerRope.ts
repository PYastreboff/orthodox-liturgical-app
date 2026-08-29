/** Standard Orthodox prayer-rope lengths (knots / Jesus Prayers per round). */
export const ROPE_LENGTH_PRESETS = [33, 50, 100] as const;

export type RopeLength = (typeof ROPE_LENGTH_PRESETS)[number];

export type RopeElement =
  | { kind: 'knot'; index: number }
  | { kind: 'divider'; afterKnot: number };

export type RopeDecade = {
  knots: number[];
  dividerAfter: boolean;
};

/** Marker-bead positions — one larger bead after every 10 prayers. */
export function dividerKnots(length: RopeLength): readonly number[] {
  const result: number[] = [];
  for (let knot = 10; knot <= length; knot += 10) {
    result.push(knot);
  }
  return result;
}

export function buildRopeDecades(length: RopeLength): RopeDecade[] {
  const decades: RopeDecade[] = [];
  for (let start = 1; start <= length; start += 10) {
    const end = Math.min(start + 9, length);
    const knots: number[] = [];
    for (let knot = start; knot <= end; knot += 1) {
      knots.push(knot);
    }
    decades.push({
      knots,
      dividerAfter: end % 10 === 0,
    });
  }
  return decades;
}

export function buildRopeElements(length: RopeLength): RopeElement[] {
  const dividers = new Set(dividerKnots(length));
  const elements: RopeElement[] = [];
  for (let knot = 1; knot <= length; knot += 1) {
    elements.push({ kind: 'knot', index: knot });
    if (dividers.has(knot)) {
      elements.push({ kind: 'divider', afterKnot: knot });
    }
  }
  return elements;
}

export function isDividerCount(count: number, length: RopeLength): boolean {
  return dividerKnots(length).includes(count);
}

export function normalizeRopeLength(value: number): RopeLength {
  if (ROPE_LENGTH_PRESETS.includes(value as RopeLength)) return value as RopeLength;
  return 100;
}

export function ropeBeadMetrics(length: RopeLength): {
  knot: number;
  divider: number;
  gap: number;
} {
  if (length <= 33) return { knot: 7, divider: 11, gap: 5 };
  if (length <= 50) return { knot: 6, divider: 10, gap: 4 };
  return { knot: 5, divider: 8, gap: 3 };
}

export type RopeLayoutNode = {
  id: string;
  prayerIndex: number;
  kind: 'knot' | 'divider';
  x: number;
  y: number;
  size: number;
};

/** Lay all beads on one horizontal cord; marker beads are larger but stay in line. */
export function layoutPrayerRope(
  length: RopeLength,
  metrics: ReturnType<typeof ropeBeadMetrics>,
): { sequence: RopeLayoutNode[]; width: number; height: number; centerY: number } {
  const elements = buildRopeElements(length);
  const centerY = metrics.divider / 2;
  const sequence: RopeLayoutNode[] = [];
  let x = metrics.knot / 2;

  for (const element of elements) {
    if (element.kind === 'knot') {
      sequence.push({
        id: `knot-${element.index}`,
        prayerIndex: element.index,
        kind: 'knot',
        x,
        y: centerY,
        size: metrics.knot,
      });
      x += metrics.knot + metrics.gap;
    } else {
      sequence.push({
        id: `divider-${element.afterKnot}`,
        prayerIndex: element.afterKnot,
        kind: 'divider',
        x,
        y: centerY,
        size: metrics.divider,
      });
      x += metrics.divider + metrics.gap;
    }
  }

  const width = sequence.length > 0 ? x - metrics.gap / 2 : metrics.knot;
  return { sequence, width, height: metrics.divider, centerY };
}
