/**
 * Central definition of every engine → UI event.
 *
 * These interfaces are consumed by `EventEmitter<GameEvent>`
 * so any typo or mismatched payload will be caught at compile-time.
 */

import type { BoardState, BoardCoord, BoardUpdateData } from '../types/Board';
import type { Move } from '../types/Move';
// import type { AppEvent } from '../services/EventEmitter'; // optional re-export

/* ------------------------------------------------------------------ */
/*                            EVENT TYPES                              */
/* ------------------------------------------------------------------ */

/** Full board refresh (pieces + highlights). */
export interface BoardUpdateEvent {
  type: 'boardUpdate';
  data: {
    board: BoardState;
    updateData: BoardUpdateData & {
      /** Highlight the king when in check (optional). */
      kingInCheckPos?: BoardCoord;
    };
  };
}

/** Textual UI bits like “White to move (Check!)”. */
export interface UITextUpdateEvent {
  type: 'uiTextUpdate';
  data: {
    text: string;
    isCheck: boolean;
  };
}

/** Check-mate, stalemate, 50-move rule, etc. */
export interface GameEndEvent {
  type: 'gameEnd';
  data: {
    message: string;
  };
}

/** Ask the UI to present the promotion picker. */
export interface PromotionEvent {
  type: 'promotion';
  data: {
    move: Move;
  };
}

/* ------------------------------------------------------------------ */
/*                          UNION EXPORT                               */
/* ------------------------------------------------------------------ */

/**
 * Union of every event the engine can emit.
 * Extend this whenever you add a new event.
 */
export type GameEvent =
  | BoardUpdateEvent
  | UITextUpdateEvent
  | GameEndEvent
  | PromotionEvent;