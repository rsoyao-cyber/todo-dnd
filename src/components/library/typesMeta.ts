import type { ConsumedItem } from '../../db/schema';
import type { SpriteName } from '../sprites/sprites';

export const TYPE_META: Record<ConsumedItem['type'], { label: string; abbr: string; glyph: SpriteName }> = {
  book:  { label: 'Book',  abbr: 'BOOK', glyph: 'scroll'  },
  movie: { label: 'Film',  abbr: 'FILM', glyph: 'eye'     },
  show:  { label: 'TV',    abbr: 'TV',   glyph: 'lantern' },
  video: { label: 'Video', abbr: 'VID',  glyph: 'feather' },
  game:  { label: 'Game',  abbr: 'GAME', glyph: 'd20'     },
  other: { label: 'Other', abbr: '+',    glyph: 'chest'   },
};

export const TYPE_ORDER: ConsumedItem['type'][] = ['book', 'movie', 'show', 'video', 'game', 'other'];
