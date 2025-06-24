// Pawn movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceColor } from '../../types/Piece';
import type { PieceValidator } from './PieceValidator';
import { CoordinateUtils } from '../../utils/CoordinateUtils';


export class PawnValidator implements PieceValidator {
  private color: PieceColor;

  constructor(color: PieceColor) {
    this.color = color;
  }

  // --- NEW METHOD ---
  /**
   * Generate potential pawn moves (forward and capture squares).
   * Note: It generates capture squares even if no piece is there.
   * The Game logic will validate if a capture is legal.
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const moves: BoardCoord[] = [];
    const direction = this.color === 'white' ? 1 : -1;
    const startRow = this.color === 'white' ? 1 : 6;

    // 1. Single square forward
    const oneStep: BoardCoord = { row: from.row + direction, col: from.col };
    if (CoordinateUtils.isValidCoord(oneStep)) {
      moves.push(oneStep);
    }

    // 2. Two squares forward from starting position
    if (from.row === startRow) {
      const twoSteps: BoardCoord = { row: from.row + 2 * direction, col: from.col };
      if (CoordinateUtils.isValidCoord(twoSteps)) {
        moves.push(twoSteps);
      }
    }

    // 3. Diagonal capture squares
    const captureLeft: BoardCoord = { row: from.row + direction, col: from.col - 1 };
    if (CoordinateUtils.isValidCoord(captureLeft)) {
      moves.push(captureLeft);
    }
    const captureRight: BoardCoord = { row: from.row + direction, col: from.col + 1 };
    if (CoordinateUtils.isValidCoord(captureRight)) {
      moves.push(captureRight);
    }

    return moves;
  }

  /**
   * Validate pawn move
   * @param board - Board state
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid pawn move
   */
  isValidMove(board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    const direction = this.color === 'white' ? 1 : -1;
    const startRow = this.color === 'white' ? 1 : 6;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);
    const destinationPiece = board[to.row][to.col];

    // Forward move (one square)
    if (rowDiff === direction && colDiff === 0 && !destinationPiece) {
      return true;
    }

    // Forward move (two squares from starting position)
    if (from.row === startRow && rowDiff === 2 * direction && colDiff === 0 && 
        !destinationPiece && !board[from.row + direction][from.col]) {
      return true;
    }

    // Diagonal capture
    if (rowDiff === direction && colDiff === 1 && destinationPiece && 
        destinationPiece.color !== this.color) {
      return true;
    }

    return false;
  }

  /**
   * Check if pawn reaches promotion square
   * @param to - Target position
   * @returns True if promotion square
   */
  isPromotionSquare(to: BoardCoord): boolean {
    const promotionRank = this.color === 'white' ? 7 : 0;
    return to.row === promotionRank;
  }
}