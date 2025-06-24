// Move-related type definitions
import type { Piece, PieceType } from './Piece';
import type { BoardCoord } from './Board';

export interface Move {
  from: BoardCoord;
  to: BoardCoord;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
}