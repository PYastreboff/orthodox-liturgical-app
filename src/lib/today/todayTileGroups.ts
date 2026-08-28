import type { ClergyRole } from '../../types/liturgical';
import { todayHomeTiles, type TodaySectionId, type TodayTileDef } from './todaySections';

export type TodayTileGroupId = 'worship' | 'theDay' | 'serving';

export type TodayTileGroup = {
  id: TodayTileGroupId;
  titleKey: string;
};

const GROUP_ORDER: readonly { id: TodayTileGroupId; titleKey: string; tileIds: readonly TodaySectionId[] }[] =
  [
    {
      id: 'worship',
      titleKey: 'today.groupWorship',
      tileIds: ['jesusPrayer', 'prayers', 'liturgy', 'readings'],
    },
    {
      id: 'theDay',
      titleKey: 'today.groupTheDay',
      tileIds: ['date', 'fasting', 'feasts', 'saints', 'services'],
    },
    {
      id: 'serving',
      titleKey: 'today.groupServing',
      tileIds: [
        'vestments',
        'choirGuide',
        'altarRoles',
        'readerGuide',
        'deaconGuide',
        'priestGuide',
      ],
    },
  ];

export type TodayTileGroupBlock = {
  group: TodayTileGroup;
  tiles: TodayTileDef[];
};

/** Home sections grouped for the Today tile grid. */
export function todayTileGroups(servingRole: ClergyRole): TodayTileGroupBlock[] {
  const allTiles = todayHomeTiles(servingRole);
  const byId = new Map(allTiles.map((tile) => [tile.id, tile]));

  return GROUP_ORDER.map((entry) => ({
    group: { id: entry.id, titleKey: entry.titleKey },
    tiles: entry.tileIds
      .map((id) => byId.get(id))
      .filter((tile): tile is TodayTileDef => tile != null),
  })).filter((block) => block.tiles.length > 0);
}
