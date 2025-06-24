// Board-related type definitions
import type { Piece } from './Piece';
import type { Move } from './Move';

export type BoardCoord = { row: number; col: number };
export type Position = BoardCoord; // Alias for compatibility
export type BoardState = (Piece | null)[][];
export type Square = Piece | null;

export interface BoardUpdateData {
  lastMove: Move | null;
  isCheck: boolean;
  validMoves: Move[];
  selectedSquare: BoardCoord | null;
  // The position of the king that is currently in check.
  // It is optional because the king is not always in check.
  kingInCheckPos?: BoardCoord;
}