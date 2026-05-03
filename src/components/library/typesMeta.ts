import type { ConsumedItem } from '../../db/schema';

export const TYPE_META: Record<ConsumedItem['type'], { label: string; abbr: string }> = {
  book:  { label: 'Book',  abbr: 'BOOK' },
  movie: { label: 'Film',  abbr: 'FILM' },
  show:  { label: 'TV',    abbr: 'TV'   },
  video: { label: 'Video', abbr: 'VID'  },
  game:  { label: 'Game',  abbr: 'GAME' },
  other: { label: 'Other', abbr: '+'    },
};

export const TYPE_ORDER: ConsumedItem['type'][] = ['book', 'movie', 'show', 'video', 'game', 'other'];
