// Handles pawn promotion
import type { BoardState, BoardCoord } from '../../types/Board';
import type { Piece, PieceType } from '../../types/Piece';
import type { Move } from '../../types/Move';
import { GAME_CONFIG } from '../../config/GameConfig';

export class PromotionHandler {
  /**
   * Check if pawn move results in promotion
   * @param piece - Piece being moved
   * @param to - Target position
   * @returns True if promotion needed
   */
  needsPromotion(piece: Piece, to: BoardCoord): boolean {
    if (piece.type !== 'pawn') return false;
    
    const promotionRank = GAME_CONFIG.promotion.ranks[piece.color];
    return to.row === promotionRank;
  }

  /**
   * Execute promotion on board
   * @param board - Board state
   * @param position - Position of pawn to promote
   * @param newPieceType - Type to promote to
   * @returns New board state with promotion executed
   */
  executePromotion(board: BoardState, position: BoardCoord, newPieceType: PieceType): BoardState {
    const newBoard = board.map(row => row.map(piece => piece ? { ...piece } : null));
    
    const piece = newBoard[position.row][position.col];
    if (piece && piece.type === 'pawn') {
      piece.type = newPieceType;
    }
    
    return newBoard;
  }

  
  /**
   * Reverts a pawn promotion on the board.
   * This method changes the promoted piece back to a pawn at the given position.
   * @param board - The current board state.
   * @param position - The position of the piece to unmake promotion for.
   */
  public unmakePromotion(board: BoardState, position: BoardCoord): void {
    const piece = board[position.row][position.col];
    if (piece) {
      piece.type = 'pawn';
    }
  }

  /**
   * Create a promoted move from a regular move
   * @param move - Original move
   * @param promotionType - Type to promote to
   * @returns Move with promotion details
   */
  createPromotionMove(move: Move, promotionType: PieceType): Move {
    return {
      ...move,
      promotion: promotionType
    };
  }
}