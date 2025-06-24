// Queen movement validation
import type { BoardState, BoardCoord } from '../../types/Board';
import type { PieceValidator } from './PieceValidator';
import { BishopValidator } from './BishopValidator';
import { RookValidator } from './RookValidator';

export class QueenValidator implements PieceValidator {
  private bishopValidator: BishopValidator;
  private rookValidator: RookValidator;

  constructor() {
    this.bishopValidator = new BishopValidator();
    this.rookValidator = new RookValidator();
  }

  // --- NEW METHOD ---
  /**
   * Generate potential queen moves by combining the moves of a rook and a bishop.
   * @param from - Starting position
   * @returns Array of potential destination coordinates
   */
  getPotentialMoves(from: BoardCoord): BoardCoord[] {
    const bishopMoves = this.bishopValidator.getPotentialMoves(from);
    const rookMoves = this.rookValidator.getPotentialMoves(from);
    return [...bishopMoves, ...rookMoves];
  }

  /**
   * Validate queen move (combines rook and bishop moves)
   * @param board - Board state
   * @param from - Starting position
   * @param to - Target position
   * @returns True if valid queen move
   */
  isValidMove(board: BoardState, from: BoardCoord, to: BoardCoord): boolean {
    return this.bishopValidator.isValidMove(board, from, to) || 
           this.rookValidator.isValidMove(board, from, to);
  }
}