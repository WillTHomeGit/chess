// Generates algebraic notation for moves (refactored from existing)
import type { Move } from '../types/Move';
import type { BoardState } from '../types/Board';
import { ValidatorFactory } from '../rules/validators/ValidatorFactory';

export class MoveNotation {
  /**
   * Generate algebraic notation for a move
   * @param move - Move to notate
   * @param boardBeforeMove - Board state before move
   * @param isCheck - Whether move results in check
   * @param isCheckmate - Whether move results in checkmate
   * @returns Algebraic notation string
   */
  public static getMoveNotation(
    move: Move,
    boardBeforeMove: BoardState,
    isCheck: boolean,
    isCheckmate: boolean
  ): string {
    let notation = '';

    // Handle castling
    if (move.isCastling) {
      const suffix = isCheckmate ? '#' : (isCheck ? '+' : '');
      return (move.isCastling === 'kingside' ? 'O-O' : 'O-O-O') + suffix;
    }

    const piece = move.piece;
    const fromFile = String.fromCharCode(97 + move.from.col);
    const toFile = String.fromCharCode(97 + move.to.col);
    const toRank = move.to.row + 1;
    const isCapture = !!boardBeforeMove[move.to.row][move.to.col] || move.isEnPassant;

    // Piece notation (pawns have no letter)
    if (piece.type !== 'pawn') {
      notation += piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
      
      // Add disambiguation if needed
      const disambiguation = this.getDisambiguation(move, boardBeforeMove);
      notation += disambiguation;
    }

    // Capture notation
    if (isCapture) {
      if (piece.type === 'pawn') {
        notation += fromFile;
      }
      notation += 'x';
    }

    // Destination square
    notation += toFile + toRank;

    // Promotion
    if (move.promotion) {
      notation += '=' + (move.promotion === 'knight' ? 'N' : move.promotion.charAt(0).toUpperCase());
    }

    // Check/Checkmate
    if (isCheckmate) {
      notation += '#';
    } else if (isCheck) {
      notation += '+';
    }

    return notation;
  }

  /**
   * Get disambiguation string for piece moves
   * @param move - Move being notated
   * @param boardBeforeMove - Board state before move
   * @returns Disambiguation string (file, rank, or both)
   */
  private static getDisambiguation(move: Move, boardBeforeMove: BoardState): string {
    const movingPiece = move.piece;
    const fromPos = move.from;
    const toPos = move.to;
    const ambiguousPieces: {row: number, col: number}[] = [];

    // Find other pieces that could make the same move
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === fromPos.row && c === fromPos.col) continue;

        const otherPiece = boardBeforeMove[r][c];
        if (otherPiece && otherPiece.type === movingPiece.type && otherPiece.color === movingPiece.color) {
          const validator = ValidatorFactory.getValidator(otherPiece);
          if (validator.isValidMove(boardBeforeMove, { row: r, col: c }, toPos)) {
            ambiguousPieces.push({ row: r, col: c });
          }
        }
      }
    }

    if (ambiguousPieces.length === 0) {
      return '';
    }

    // Check if file disambiguation is sufficient
    const sameFile = ambiguousPieces.some(p => p.col === fromPos.col);
    if (!sameFile) {
      return String.fromCharCode(97 + fromPos.col);
    }

    // Check if rank disambiguation is sufficient
    const sameRank = ambiguousPieces.some(p => p.row === fromPos.row);
    if (!sameRank) {
      return (fromPos.row + 1).toString();
    }

    // Need both file and rank
    return String.fromCharCode(97 + fromPos.col) + (fromPos.row + 1).toString();
  }
}